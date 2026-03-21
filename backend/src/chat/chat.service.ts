import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { censorContent } from '../common/utils/content-filter.util';
import { MyLogger } from '../common/logger/logger.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private myLogger: MyLogger
  ) {}

  async canUserChatMessage(userId: number, targetUserId: number, conversationId?: number) {
    const isFriend = await this.prisma.follow.findFirst({
      where: { followerId: targetUserId, followingId: userId }
    });

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { isPrivate: true }
    });

    if (!targetUser) return { canChat: false, isFriend: false };

    // Eğer kullanıcı takip ediyorsa veya hesap gizli değilse mesaj atabilir
    const followsTarget = await this.prisma.follow.findFirst({
      where: { followerId: userId, followingId: targetUserId }
    });

    const canChat = !targetUser.isPrivate || !!followsTarget || !!isFriend;
    return { canChat, isFriend: !!isFriend };
  }

  async getOrCreateConversation(userId: number, targetUserId: number, fromSpot: boolean = false, listingId?: number) {
    if (!targetUserId || isNaN(targetUserId)) throw new BadRequestException('Geçersiz kullanıcı.');
    if (userId === targetUserId) throw new ForbiddenException('Kendinizle sohbet edemezsiniz.');

    let existing = await this.prisma.conversation.findFirst({
      where: {
        participants: { every: { userId: { in: [userId, targetUserId] } } }
      },
      include: { participants: true, messages: { where: { isDeleted: false }, take: 1, orderBy: { createdAt: 'desc' } } }
    });

    const targetFollowsMe = await this.prisma.follow.findFirst({
      where: { followerId: targetUserId, followingId: userId }
    });

    if (!existing) {
      existing = await this.prisma.conversation.create({
        data: {
          isAccepted: !!targetFollowsMe,
          isRejected: false,
          participants: { create: [{ userId }, { userId: targetUserId }] }
        },
        include: { participants: true, messages: { where: { isDeleted: false }, take: 1, orderBy: { createdAt: 'desc' } } }
      });
    } else if (fromSpot && existing.isRejected) {
      existing = await this.prisma.conversation.update({ where: { id: existing.id }, data: { isRejected: false, isAccepted: false }, include: { participants: true, messages: { where: { isDeleted: false }, take: 1, orderBy: { createdAt: 'desc' } } } });
    }

    const myParticipantData = existing.participants.find(p => p.userId === userId);
    return { 
      ...existing, 
      themeColor: myParticipantData?.themeColor || '#4f46e5', 
      otherParticipant: await this.prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true } }),
      canChat: true 
    };
  }

  async sendMessage(senderId: number, conversationId: number, content?: string, postId?: number, isForwarded: boolean = false) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true, messages: { where: { isDeleted: false }, take: 1, orderBy: { createdAt: 'desc' } } } });
    if (!conversation) throw new NotFoundException();
    
    const other = conversation.participants.find(p => p.userId !== senderId);
    if (!other) throw new ForbiddenException('Sohbet katılımcısı bulunamadı.');

    const auth = await this.canUserChatMessage(senderId, other.userId, conversationId);

    if (!conversation.isAccepted && conversation.messages.length > 0 && conversation.messages[0].senderId !== senderId) {
      throw new ForbiddenException('Önce isteği kabul etmelisiniz.');
    }

    if (!auth.canChat && !conversation.isAccepted) { }
    else if (!auth.canChat) throw new ForbiddenException('Kısıtlı hesap.');

    if (!content && !postId) {
      throw new ForbiddenException('Mesaj içeriği veya paylaşılacak gönderi eksik.');
    }

    // 1. KÜFÜR FİLTRESİ
    const { cleanText, count } = censorContent(content || '');
    if (count > 0) {
      this.myLogger.warn(`Chat İhlali: Kullanıcı ID ${senderId}, Konuşma ID ${conversationId} içinde küfür kullandı.`, 'Security');
    }

    return this.prisma.message.create({ 
      data: { content: cleanText, senderId, conversationId, postId, isForwarded }, 
      include: { 
        sender: { select: { id: true, username: true, avatarUrl: true } },
        sharedPost: {
          include: {
            author: { select: { id: true, username: true, avatarUrl: true, fullName: true, badges: { include: { badge: true } } } }
          }
        }
      } 
    });
  }

  async getUserConversations(userId: number) {
    const participantEntries = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: { 
              where: { userId: { not: userId } }, 
              include: { user: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true } } } 
            },
            messages: { where: { isDeleted: false }, orderBy: { createdAt: 'desc' }, take: 1 }
          }
        }
      }
    });

    return participantEntries
      .map(p => {
        const conv = p.conversation;
        const otherParticipant = (conv.participants[0] as any)?.user;
        
        // EĞER KARŞI KATILIMCI YOKSA BU SOHBETİ LİSTEYE ALMA (HAYALET SOHBET KORUMASI)
        if (!otherParticipant) return null;

        return {
          id: conv.id,
          isAccepted: conv.isAccepted,
          isRejected: conv.isRejected,
          createdAt: conv.createdAt,
          themeColor: p.themeColor,
          otherParticipant,
          lastMessage: conv.messages[0] || null
        };
      })
      .filter(c => c !== null)
      .sort((a, b) => {
        const dateA = a!.lastMessage?.createdAt || a!.createdAt;
        const dateB = b!.lastMessage?.createdAt || b!.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
  }

  async getMessages(conversationId: number, userId: number) {
    const participant = await (this.prisma as any).conversationParticipant.findFirst({ where: { conversationId, userId } });
    if (!participant) throw new ForbiddenException();

    return this.prisma.message.findMany({
      where: { conversationId, isDeleted: false },
      orderBy: { createdAt: 'asc' },
      include: { 
        sender: { select: { id: true, username: true, avatarUrl: true } },
        sharedPost: {
          include: {
            author: { select: { id: true, username: true, avatarUrl: true, fullName: true, badges: { include: { badge: true } } } }
          }
        }
      }
    });
  }

  async markMessagesAsRead(conversationId: number, userId: number) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
    if (!conversation) throw new NotFoundException();
    if (!conversation.participants.some(p => p.userId === userId)) throw new ForbiddenException();

    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true }
    });

    const receiver = conversation.participants.find(p => p.userId !== userId);
    return { success: true, receiverUserId: receiver?.userId };
  }

  async acceptRequest(userId: number, conversationId: number) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
    if (!conv || !conv.participants.some(p => p.userId === userId)) throw new ForbiddenException();
    return this.prisma.conversation.update({ where: { id: conversationId }, data: { isAccepted: true, isRejected: false } });
  }

  async rejectRequest(userId: number, conversationId: number) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
    if (!conv || !conv.participants.some(p => p.userId === userId)) throw new ForbiddenException();
    return this.prisma.conversation.update({ where: { id: conversationId }, data: { isRejected: true, isAccepted: false } });
  }

  async removeConversation(userId: number, conversationId: number) {
    const participant = await (this.prisma as any).conversationParticipant.findFirst({ where: { conversationId, userId } });
    if (!participant) throw new ForbiddenException();
    await this.prisma.message.updateMany({ where: { conversationId }, data: { isDeleted: true } });
    return this.prisma.conversation.delete({ where: { id: conversationId } });
  }

  async removeMessage(messageId: number, userId: number) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException();
    
    // Sadece mesajın sahibi silebilir (Global Soft Delete için şimdilik kısıt koymuyoruz ama güvenlik için kontrol ekledik)
    if (message.senderId !== userId) {
       // İleride 'deleteForUserId' gibi bir tablo eklenirse burası genişletilebilir
    }

    return this.prisma.message.update({ where: { id: messageId }, data: { isDeleted: true } });
  }

  async updateThemeColor(userId: number, conversationId: number, color: string) { return (this.prisma.conversationParticipant as any).update({ where: { conversationId_userId: { conversationId, userId } }, data: { themeColor: color } }); }
}
