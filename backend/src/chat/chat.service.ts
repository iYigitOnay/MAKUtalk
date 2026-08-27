import { Injectable, ForbiddenException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { censorContent } from '../common/utils/content-filter.util';
import { MyLogger } from '../common/logger/logger.service';
import { SnowflakeService } from '../common/snowflake/snowflake.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private myLogger: MyLogger,
    private snowflakeService: SnowflakeService
  ) {}

  async canUserChatMessage(userId: bigint, targetUserId: bigint) {
    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId }, select: { isPrivate: true } });
    if (!targetUser) return { canChat: false, isFriend: false };
    const isFriend = await this.prisma.follow.findFirst({ where: { followerId: targetUserId, followingId: userId } });
    const followsTarget = await this.prisma.follow.findFirst({ where: { followerId: userId, followingId: targetUserId } });
    const canChat = !targetUser.isPrivate || !!followsTarget || !!isFriend;
    return { canChat, isFriend: !!isFriend };
  }

  async getOrCreateConversation(userId: bigint, targetUserId: bigint) {
    if (userId === targetUserId) throw new ForbiddenException('Kendinizle sohbet edemezsiniz.');

    const [currentUser, targetUser] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.user.findUnique({ where: { id: targetUserId } }),
    ]);

    if (!currentUser || !targetUser) {
      throw new ForbiddenException('Kullanıcı bulunamadı.');
    }

    const potentialConversations = await this.prisma.conversation.findMany({
      where: { AND: [{ participants: { some: { userId: userId } } }, { participants: { some: { userId: targetUserId } } }] },
      include: { participants: true, messages: { where: { isDeleted: false }, take: 1, orderBy: { createdAt: 'desc' } } }
    });

    let existing: any = null;
    if (potentialConversations.length > 0) {
      existing = potentialConversations.sort((a, b) => b.participants.length - a.participants.length)[0];
      if (potentialConversations.length > 1) {
        const toDelete = potentialConversations.filter(c => c.id !== existing.id);
        for (const c of toDelete) await this.prisma.conversation.delete({ where: { id: c.id } }).catch(() => {});
      }
      if (existing && existing.participants.length < 2) {
        await this.prisma.conversation.delete({ where: { id: existing.id } }).catch(() => {});
        existing = null;
      }
    }

    // Eğer mevcut sohbet varsa ve kullanıcı daha önce silmişse tekrar göster
    if (existing) {
      await this.prisma.conversationParticipant.updateMany({
        where: { conversationId: existing.id, userId, deletedAt: { not: null } },
        data: { deletedAt: null },
      });
    }

    const targetFollowsMe = await this.prisma.follow.findFirst({ where: { followerId: targetUserId, followingId: userId } });
    const isFriend = !!targetFollowsMe;
    const isAutoAccepted = isFriend;

    if (!existing) {
      const convId = this.snowflakeService.getNextId();
      existing = await this.prisma.conversation.create({
        data: {
          id: convId,
          isAccepted: isAutoAccepted,
          isRejected: false,
          requesterId: isAutoAccepted ? null : userId,
          participants: {
            create: [
              { id: this.snowflakeService.getNextId(), userId: userId },
              { id: this.snowflakeService.getNextId(), userId: targetUserId }
            ]
          }
        },
        include: { participants: true, messages: { where: { isDeleted: false }, take: 1, orderBy: { createdAt: 'desc' } } }
      });
    }

    if (!existing) throw new Error("Sohbet oluşturulamadı.");
    const myPart = existing.participants.find((p: any) => p.userId === userId);
    const otherPart = await this.prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true } });

    return {
      ...existing,
      themeColor: myPart?.themeColor || '#4f46e5',
      otherParticipant: otherPart,
      isFriend,
      requesterId: (existing.requesterId ?? (!isAutoAccepted ? userId : null))?.toString() ?? null,
    };
  }

  async sendMessage(senderId: bigint, conversationId: bigint, content?: string, postId?: bigint, isForwarded: boolean = false, mediaUrl?: string, mediaType?: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
    if (!conversation) throw new NotFoundException('Sohbet bulunamadı.');
    const isUserParticipant = conversation.participants.some(p => p.userId === senderId);
    if (!isUserParticipant) throw new ForbiddenException('Yetkisiz erişim.');

    if (!content && !postId && !mediaUrl) throw new ForbiddenException('İçerik eksik.');

    let cleanText: string | null = null;
    if (content) {
      const censored = censorContent(content);
      cleanText = censored.cleanText;
      if (censored.count > 0) this.myLogger.warn(`Chat İhlali: User ${senderId}`, 'Security');
    }

    return this.prisma.message.create({ 
      data: { 
        id: this.snowflakeService.getNextId(), // SNOWFLAKE ID
        content: cleanText, 
        senderId: senderId, 
        conversationId: conversationId, 
        postId: postId, 
        isForwarded, 
        mediaUrl, 
        mediaType 
      }, 
      include: { 
        sender: { select: { id: true, username: true, avatarUrl: true } },
        sharedPost: { include: { author: { select: { id: true, username: true, avatarUrl: true, fullName: true, badges: { include: { badge: true } } } } } }
      } 
    });
  }

  async getUserConversations(userId: bigint) {
    const participantEntries = await this.prisma.conversationParticipant.findMany({
      where: { userId: userId, deletedAt: null },
      include: { conversation: { include: { participants: { include: { user: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true } } } }, messages: { where: { isDeleted: false }, orderBy: { createdAt: 'desc' }, take: 1 } } } }
    });

    const otherUserIds = participantEntries
      .map(p => p.conversation.participants.find(part => part.userId !== userId)?.userId)
      .filter(Boolean) as bigint[];

    const friendFollows = otherUserIds.length > 0
      ? await this.prisma.follow.findMany({ where: { followerId: { in: otherUserIds }, followingId: userId }, select: { followerId: true } })
      : [];
    const friendSet = new Set(friendFollows.map(f => f.followerId.toString()));

    return participantEntries.map(p => {
      const conv = p.conversation;
      const other = conv.participants.find(part => part.userId !== userId);
      if (!other?.user) return null;
      const isFriend = friendSet.has(other.userId.toString());
      return {
        id: conv.id,
        isAccepted: conv.isAccepted,
        isRejected: conv.isRejected,
        requesterId: conv.requesterId?.toString() ?? null,
        createdAt: conv.createdAt,
        themeColor: p.themeColor,
        otherParticipant: other.user,
        lastMessage: conv.messages[0] || null,
        isFriend,
      };
    }).filter(c => c !== null).sort((a, b) => {
      const dateA = a!.lastMessage?.createdAt || a!.createdAt;
      const dateB = b!.lastMessage?.createdAt || b!.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }

  async getMessages(conversationId: bigint, userId: bigint) {
    const participant = await this.prisma.conversationParticipant.findFirst({ where: { conversationId: conversationId, userId: userId } });
    if (!participant) throw new ForbiddenException('Yetkisiz.');
    return this.prisma.message.findMany({
      where: { conversationId: conversationId, isDeleted: false },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, username: true, avatarUrl: true } }, sharedPost: { include: { author: { select: { id: true, username: true, avatarUrl: true, fullName: true, badges: { include: { badge: true } } } } } } }
    });
  }

  async markMessagesAsRead(conversationId: bigint, userId: bigint) {
    const isPart = await this.prisma.conversationParticipant.findFirst({ where: { conversationId: conversationId, userId: userId } });
    if (!isPart) throw new ForbiddenException();
    await this.prisma.message.updateMany({ where: { conversationId: conversationId, senderId: { not: userId }, isRead: false }, data: { isRead: true } });
    const otherPart = await this.prisma.conversationParticipant.findFirst({ where: { conversationId: conversationId, userId: { not: userId } } });
    return { success: true, receiverUserId: otherPart?.userId };
  }

  async acceptRequest(userId: bigint, conversationId: bigint) {
    const isPart = await this.prisma.conversationParticipant.findFirst({ where: { conversationId: conversationId, userId: userId } });
    if (!isPart) throw new ForbiddenException();
    return this.prisma.conversation.update({ where: { id: conversationId }, data: { isAccepted: true, isRejected: false } });
  }

  async rejectRequest(userId: bigint, conversationId: bigint) {
    const isPart = await this.prisma.conversationParticipant.findFirst({ where: { conversationId: conversationId, userId: userId } });
    if (!isPart) throw new ForbiddenException();
    return this.prisma.conversation.update({ where: { id: conversationId }, data: { isRejected: true, isAccepted: false } });
  }

  async removeConversation(userId: bigint, conversationId: bigint) {
    const isPart = await this.prisma.conversationParticipant.findFirst({ where: { conversationId: conversationId, userId: userId } });
    if (!isPart) throw new ForbiddenException();

    // Sadece bu kullanıcı için sohbeti gizle, karşı taraf etkilenmesin
    await this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { deletedAt: new Date() },
    });

    // Eğer her iki taraf da silmişse conversation'ı tamamen kaldır
    const remaining = await this.prisma.conversationParticipant.count({
      where: { conversationId, deletedAt: null },
    });
    if (remaining === 0) {
      await this.prisma.conversation.delete({ where: { id: conversationId } });
    }

    return { success: true };
  }

  async removeMessage(messageId: bigint, userId: bigint) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException();
    return this.prisma.message.update({ where: { id: messageId }, data: { isDeleted: true } });
  }

  async updateThemeColor(userId: bigint, conversationId: bigint, color: string) { 
    return this.prisma.conversationParticipant.update({ where: { conversationId_userId: { conversationId: conversationId, userId: userId } }, data: { themeColor: color } }); 
  }
}
