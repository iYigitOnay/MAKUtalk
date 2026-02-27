import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  private readonly encryptionKey: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.encryptionKey = this.configService.get<string>('JWT_SECRET') || 'default_secret_key';
  }

  // Kullanıcının tüm konuşmalarını getir
  async getUserConversations(userId: number) {
    const participantEntries = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              where: { NOT: { userId } },
              include: { user: { select: { id: true, username: true, fullName: true, avatarUrl: true } } }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    return participantEntries.map((entry: any) => ({
      id: entry.conversation.id,
      themeColor: entry.themeColor || '#4f46e5', // Kendi özel rengi
      otherParticipant: entry.conversation.participants[0]?.user,
      lastMessage: entry.conversation.messages[0],
      joinedAt: entry.joinedAt
    })).sort((a, b) => {
      const timeA = a.lastMessage?.createdAt.getTime() || 0;
      const timeB = b.lastMessage?.createdAt.getTime() || 0;
      return timeB - timeA;
    });
  }

  // İki kullanıcı arasında konuşma bul veya oluştur
  async getOrCreateConversation(userId: number, targetUserId: number) {
    let existing = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: targetUserId } } }
        ]
      },
      include: {
        participants: true
      }
    });

    // Engelleme ve Gizlilik Kontrolleri (Kısa geçiyorum, mantık aynı)
    const isBlockedByMe = await this.prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId: userId, blockedId: targetUserId } } });
    const amIBlocked = await this.prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId: targetUserId, blockedId: userId } } });
    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true } });

    let isFollowing = false;
    if (targetUser?.isPrivate) {
      const follow = await this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userId, followingId: targetUserId } } });
      isFollowing = !!follow;
    }

    if (!existing) {
      if (targetUser?.isPrivate && !isFollowing && userId !== targetUserId) {
        return { id: 0, themeColor: '#4f46e5', participants: [], isBlockedByMe: !!isBlockedByMe, amIBlocked: !!amIBlocked, isPrivateAndNotFollowing: true };
      }

      existing = await this.prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId },
              { userId: targetUserId }
            ]
          }
        },
        include: { participants: true }
      });
    }

    // KRITIK: Kendi katılımcı kaydımızdaki rengi al
    const myParticipantData = (existing.participants as any[]).find(p => p.userId === userId);

    return {
      ...(existing as any),
      themeColor: myParticipantData?.themeColor || '#4f46e5',
      otherParticipant: targetUser,
      isBlockedByMe: !!isBlockedByMe,
      amIBlocked: !!amIBlocked,
      isPrivateAndNotFollowing: targetUser?.isPrivate && !isFollowing && userId !== targetUserId
    };
  }

  // Sohbet Rengini Güncelle (Kişiye Özel)
  async updateThemeColor(userId: number, conversationId: number, color: string) {
    return (this.prisma.conversationParticipant as any).update({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      },
      data: { themeColor: color }
    });
  }

  async sendMessage(senderId: number, conversationId: number, content: string) {
    const message = await this.prisma.message.create({
      data: { content, senderId, conversationId },
      include: { sender: { select: { id: true, username: true, avatarUrl: true } } }
    });
    await this.prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
    return message;
  }

  async getMessages(conversationId: number) {
    return this.prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, username: true, avatarUrl: true } } } });
  }

  async deleteConversation(userId: number, conversationId: number) {
    return this.prisma.conversation.delete({ where: { id: conversationId } });
  }
}
