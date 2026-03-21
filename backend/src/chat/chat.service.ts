import { Injectable, ForbiddenException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { censorContent } from '../common/utils/content-filter.util';
import { MyLogger } from '../common/logger/logger.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private myLogger: MyLogger
  ) {}

  async canUserChatMessage(userId: number, targetUserId: number, conversationId?: number) {
    const uid = Number(userId);
    const tid = Number(targetUserId);

    const isFriend = await this.prisma.follow.findFirst({
      where: { followerId: tid, followingId: uid }
    });

    const targetUser = await this.prisma.user.findUnique({
      where: { id: tid },
      select: { isPrivate: true }
    });

    if (!targetUser) return { canChat: false, isFriend: false };

    const followsTarget = await this.prisma.follow.findFirst({
      where: { followerId: uid, followingId: tid }
    });

    const canChat = !targetUser.isPrivate || !!followsTarget || !!isFriend;
    return { canChat, isFriend: !!isFriend };
  }

  async getOrCreateConversation(userId: number, targetUserId: number, fromSpot: boolean = false, listingId?: number) {
    const uid = Number(userId);
    const tid = Number(targetUserId);

    if (!tid || isNaN(tid)) throw new BadRequestException('Geçersiz kullanıcı.');
    if (uid === tid) throw new ForbiddenException('Kendinizle sohbet edemezsiniz.');

    // KESİN SORGULAMA: Her iki katılımcının da olduğu sohbetleri bul
    const potentialConversations = await this.prisma.conversation.findMany({
      where: {
        AND: [
          { participants: { some: { userId: uid } } },
          { participants: { some: { userId: tid } } }
        ]
      },
      include: { participants: true, messages: { where: { isDeleted: false }, take: 1, orderBy: { createdAt: 'desc' } } }
    });

    let existing = null;

    if (potentialConversations.length > 0) {
      // Eğer birden fazla varsa (HATA DURUMU), en sağlıklı olanı seç, diğerlerini arka planda temizle
      existing = potentialConversations.sort((a, b) => b.participants.length - a.participants.length)[0];
      
      if (potentialConversations.length > 1) {
        this.logger.warn(`Duplicate sohbetler bulundu, temizleniyor...`);
        const toDelete = potentialConversations.filter(c => c.id !== existing.id);
        for (const c of toDelete) {
          await this.prisma.conversation.delete({ where: { id: c.id } }).catch(() => {});
        }
      }

      // Seçtiğimiz de bozuksa (tek kişiyse) sil ve yeniden oluştur
      if (existing.participants.length < 2) {
        await this.prisma.conversation.delete({ where: { id: existing.id } }).catch(() => {});
        existing = null;
      }
    }

    const targetFollowsMe = await this.prisma.follow.findFirst({
      where: { followerId: tid, followingId: uid }
    });

    if (!existing) {
      existing = await this.prisma.conversation.create({
        data: {
          isAccepted: !!targetFollowsMe,
          isRejected: false,
          participants: { create: [{ userId: uid }, { userId: tid }] }
        },
        include: { participants: true, messages: { where: { isDeleted: false }, take: 1, orderBy: { createdAt: 'desc' } } }
      });
    } else if (fromSpot && existing.isRejected) {
      existing = await this.prisma.conversation.update({ 
        where: { id: existing.id }, 
        data: { isRejected: false, isAccepted: false }, 
        include: { participants: true, messages: { where: { isDeleted: false }, take: 1, orderBy: { createdAt: 'desc' } } } 
      });
    }

    const myParticipantData = existing.participants.find(p => Number(p.userId) === uid);
    const otherParticipantData = await this.prisma.user.findUnique({ 
      where: { id: tid }, 
      select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true } 
    });

    return { 
      ...existing, 
      themeColor: myParticipantData?.themeColor || '#4f46e5', 
      otherParticipant: otherParticipantData,
      canChat: true 
    };
  }

  async sendMessage(senderId: number, conversationId: number, content?: string, postId?: number, isForwarded: boolean = false) {
    const uid = Number(senderId);
    const cid = Number(conversationId);

    const conversation = await this.prisma.conversation.findUnique({ 
      where: { id: cid }, 
      include: { participants: true, messages: { where: { isDeleted: false }, take: 1, orderBy: { createdAt: 'asc' } } } 
    });
    
    if (!conversation) throw new NotFoundException('Sohbet bulunamadı.');
    
    const isUserParticipant = conversation.participants.some(p => Number(p.userId) === uid);
    if (!isUserParticipant) {
      this.logger.error(`SendMessage Blocked: User ${uid} is not in Conv ${cid}`);
      throw new ForbiddenException('Bu sohbete mesaj gönderme yetkiniz yok.');
    }

    const other = conversation.participants.find(p => Number(p.userId) !== uid);
    if (!other) throw new ForbiddenException('Sohbet katılımcısı bulunamadı.');

    const auth = await this.canUserChatMessage(uid, other.userId, cid);

    if (!conversation.isAccepted && conversation.messages.length > 0 && Number(conversation.messages[0].senderId) !== uid) {
      throw new ForbiddenException('Önce isteği kabul etmelisiniz.');
    }

    if (!auth.canChat && !conversation.isAccepted) { }
    else if (!auth.canChat) throw new ForbiddenException('Kısıtlı hesap.');

    if (!content && !postId) {
      throw new ForbiddenException('Mesaj içeriği veya paylaşılacak gönderi eksik.');
    }

    const { cleanText, count } = censorContent(content || '');
    if (count > 0) {
      this.myLogger.warn(`Chat İhlali: Kullanıcı ID ${uid}, Konuşma ID ${cid} içinde küfür kullandı.`, 'Security');
    }

    return this.prisma.message.create({ 
      data: { content: cleanText, senderId: uid, conversationId: cid, postId: postId ? Number(postId) : null, isForwarded }, 
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
    const uid = Number(userId);
    const participantEntries = await this.prisma.conversationParticipant.findMany({
      where: { userId: uid },
      include: {
        conversation: {
          include: {
            participants: { 
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
        const otherParticipantEntry = conv.participants.find(part => Number(part.userId) !== uid);
        const otherParticipant = otherParticipantEntry?.user;
        
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
    const cid = Number(conversationId);
    const uid = Number(userId);

    // Daha güvenli bir kontrol: Tablo isminden emin olalım
    const participant = await this.prisma.conversationParticipant.findFirst({ 
      where: { conversationId: cid, userId: uid } 
    });
    
    if (!participant) {
      this.logger.error(`Access Denied: User ${uid} is not a participant of Conv ${cid}`);
      // DEBUG: Tüm katılımcıları çekip loglayalım
      const allParts = await this.prisma.conversationParticipant.findMany({ where: { conversationId: cid } });
      this.logger.error(`Conv ${cid} actual participants: ${JSON.stringify(allParts)}`);
      throw new ForbiddenException('Bu sohbetin mesajlarına erişim yetkiniz yok.');
    }

    return this.prisma.message.findMany({
      where: { conversationId: cid, isDeleted: false },
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
    const cid = Number(conversationId);
    const uid = Number(userId);

    const isPart = await this.prisma.conversationParticipant.findFirst({ where: { conversationId: cid, userId: uid } });
    if (!isPart) throw new ForbiddenException();

    await this.prisma.message.updateMany({
      where: { conversationId: cid, senderId: { not: uid }, isRead: false },
      data: { isRead: true }
    });

    const otherPart = await this.prisma.conversationParticipant.findFirst({ where: { conversationId: cid, userId: { not: uid } } });
    return { success: true, receiverUserId: otherPart?.userId };
  }

  async acceptRequest(userId: number, conversationId: number) {
    const cid = Number(conversationId);
    const uid = Number(userId);

    const isPart = await this.prisma.conversationParticipant.findFirst({ where: { conversationId: cid, userId: uid } });
    if (!isPart) throw new ForbiddenException();
    
    return this.prisma.conversation.update({ where: { id: cid }, data: { isAccepted: true, isRejected: false } });
  }

  async rejectRequest(userId: number, conversationId: number) {
    const cid = Number(conversationId);
    const uid = Number(userId);

    const isPart = await this.prisma.conversationParticipant.findFirst({ where: { conversationId: cid, userId: uid } });
    if (!isPart) throw new ForbiddenException();

    return this.prisma.conversation.update({ where: { id: cid }, data: { isRejected: true, isAccepted: false } });
  }

  async removeConversation(userId: number, conversationId: number) {
    const cid = Number(conversationId);
    const uid = Number(userId);

    const isPart = await this.prisma.conversationParticipant.findFirst({ where: { conversationId: cid, userId: uid } });
    if (!isPart) throw new ForbiddenException();

    await this.prisma.message.updateMany({ where: { conversationId: cid }, data: { isDeleted: true } });
    return this.prisma.conversation.delete({ where: { id: cid } });
  }

  async removeMessage(messageId: number, userId: number) {
    const mid = Number(messageId);
    const uid = Number(userId);

    const message = await this.prisma.message.findUnique({ where: { id: mid } });
    if (!message) throw new NotFoundException();
    
    return this.prisma.message.update({ where: { id: mid }, data: { isDeleted: true } });
  }

  async updateThemeColor(userId: number, conversationId: number, color: string) { 
    return this.prisma.conversationParticipant.update({ 
      where: { conversationId_userId: { conversationId: Number(conversationId), userId: Number(userId) } }, 
      data: { themeColor: color } 
    }); 
  }
}
