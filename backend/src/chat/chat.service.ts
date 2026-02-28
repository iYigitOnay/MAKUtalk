import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

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
      isAccepted: entry.conversation.isAccepted,
      isRejected: entry.conversation.isRejected,
      themeColor: entry.themeColor || '#4f46e5',
      otherParticipant: entry.conversation.participants[0]?.user,
      lastMessage: entry.conversation.messages[0],
      joinedAt: entry.joinedAt
    })).sort((a, b) => {
      const timeA = a.lastMessage?.createdAt.getTime() || 0;
      const timeB = b.lastMessage?.createdAt.getTime() || 0;
      return timeB - timeA;
    });
  }

  async getOrCreateConversation(userId: number, targetUserId: number, fromSpot: boolean = false) {
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

    const isBlockedByMe = await this.prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId: userId, blockedId: targetUserId } } });
    const amIBlocked = await this.prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId: targetUserId, blockedId: userId } } });
    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true } });

    let isFollowing = false;
    if (targetUser?.isPrivate) {
      const follow = await this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userId, followingId: targetUserId } } });
      isFollowing = !!follow;
    }

    if (!existing) {
      if (!fromSpot && targetUser?.isPrivate && !isFollowing && userId !== targetUserId) {
        return { id: 0, themeColor: '#4f46e5', participants: [], isBlockedByMe: !!isBlockedByMe, amIBlocked: !!amIBlocked, isPrivateAndNotFollowing: true };
      }

      existing = await this.prisma.conversation.create({
        data: {
          isAccepted: !fromSpot, // Spot'tan geliyorsa false olarak başlar
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

    const myParticipantData = (existing.participants as any[]).find(p => p.userId === userId);

    return {
      ...(existing as any),
      themeColor: myParticipantData?.themeColor || '#4f46e5',
      otherParticipant: targetUser,
      isBlockedByMe: !!isBlockedByMe,
      amIBlocked: !!amIBlocked,
      isPrivateAndNotFollowing: existing ? false : (targetUser?.isPrivate && !isFollowing && userId !== targetUserId)
    };
  }

  async acceptRequest(userId: number, conversationId: number) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
    if (!conversation) throw new NotFoundException();
    // Alıcı mı kontrol et
    const isParticipant = conversation.participants.some(p => p.userId === userId);
    if (!isParticipant) throw new ForbiddenException();

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { isAccepted: true, isRejected: false }
    });
  }

  async rejectRequest(userId: number, conversationId: number) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { isAccepted: false, isRejected: true }
    });
  }

  async updateThemeColor(userId: number, conversationId: number, color: string) {
    return (this.prisma.conversationParticipant as any).update({
      where: {
        conversationId_userId: { conversationId, userId }
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

  async markAsRead(userId: number, conversationId: number) {
    return this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true }
    });
  }

  async deleteConversation(userId: number, conversationId: number) {
    return this.prisma.conversation.delete({ where: { id: conversationId } });
  }
}
