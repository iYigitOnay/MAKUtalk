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

  // Mesaj Şifrele
  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
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

    return participantEntries.map(entry => ({
      id: entry.conversation.id,
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
    if (isNaN(userId) || isNaN(targetUserId)) {
      throw new Error('Geçersiz kullanıcı ID.');
    }
    
    const existing = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: targetUserId } } }
        ]
      },
      include: {
        participants: {
          where: { NOT: { userId } },
          include: { user: { select: { id: true, username: true, fullName: true, avatarUrl: true } } }
        }
      }
    });

    // Engelleme durumlarını kontrol et
    const isBlockedByMe = await this.prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: userId, blockedId: targetUserId } }
    });
    const amIBlocked = await this.prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: targetUserId, blockedId: userId } }
    });

    // Gizli hesap ve takip kontrolü
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { isPrivate: true }
    });

    let isFollowing = false;
    if (targetUser?.isPrivate) {
      const follow = await this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: userId, followingId: targetUserId } }
      });
      isFollowing = !!follow;
    }

    const canMessage = !targetUser?.isPrivate || isFollowing || userId === targetUserId;

    if (existing) {
      return {
        ...existing,
        isBlockedByMe: !!isBlockedByMe,
        amIBlocked: !!amIBlocked,
        isPrivateAndNotFollowing: targetUser?.isPrivate && !isFollowing && userId !== targetUserId
      };
    }

    if (!canMessage) {
      // Sadece bilgi dön, hata fırlatma ki UI'da mesaj gösterebilelim
      return {
        id: 0, // Geçici ID
        participants: [],
        isBlockedByMe: !!isBlockedByMe,
        amIBlocked: !!amIBlocked,
        isPrivateAndNotFollowing: true
      };
    }

    const newConversation = await this.prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId },
            { userId: targetUserId }
          ]
        }
      },
      include: {
        participants: {
          where: { NOT: { userId } },
          include: { user: { select: { id: true, username: true, fullName: true, avatarUrl: true } } }
        }
      }
    });

    return {
      ...newConversation,
      isBlockedByMe: !!isBlockedByMe,
      amIBlocked: !!amIBlocked
    };
  }

  // Mesaj gönder (Gelen içerik zaten frontend'de şifrelendi)
  async sendMessage(senderId: number, conversationId: number, content: string) {
    // Katılımcıları bul
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { conversationId }
    });

    const targetParticipant = participants.find(p => p.userId !== senderId);
    if (targetParticipant) {
      const targetUserId = targetParticipant.userId;
      
      // Engelleme kontrolü
      const blockExists = await this.prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: senderId, blockedId: targetUserId },
            { blockerId: targetUserId, blockedId: senderId }
          ]
        }
      });

      if (blockExists) {
        throw new Error('Engellenmiş bir kullanıcıyla mesajlaşamazsınız.');
      }

      // Gizlilik kontrolü
      const targetUser = await this.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { isPrivate: true }
      });

      if (targetUser?.isPrivate) {
        const follow = await this.prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: senderId, followingId: targetUserId } }
        });
        if (!follow) {
          throw new Error('Mesaj göndermek için bu kullanıcıyı takip etmelisiniz.');
        }
      }
    }

    const message = await this.prisma.message.create({
      data: {
        content: content, // Şifreli içerik aynen kaydedilir
        senderId,
        conversationId
      },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } }
      }
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return message;
  }

  // Bir konuşmanın mesajlarını getir (Şifreli halleriyle döner)
  async getMessages(conversationId: number) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } }
      }
    });
  }

  // Sohbeti Sil
  async deleteConversation(userId: number, conversationId: number) {
    // Kullanıcının bu konuşmanın bir parçası olduğunu doğrula
    const isParticipant = await this.prisma.conversationParticipant.findFirst({
      where: { userId, conversationId }
    });

    if (!isParticipant) {
      throw new Error('Bu sohbeti silme yetkiniz yok.');
    }

    // Konuşmayı sil (Prisma'daki onDelete: Cascade sayesinde mesajlar da silinecek)
    return this.prisma.conversation.delete({
      where: { id: conversationId }
    });
  }
}
