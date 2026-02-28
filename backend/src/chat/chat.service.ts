import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async canUserChatMessage(senderId: number, receiverId: number, conversationId?: number) {
    if (senderId === receiverId) return { canChat: true };

    const [receiver, iFollowThem, blockCheck] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: receiverId }, select: { id: true, isPrivate: true } }),
      this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: senderId, followingId: receiverId } } }),
      this.prisma.block.findFirst({ where: { OR: [{ blockerId: senderId, blockedId: receiverId }, { blockerId: receiverId, blockedId: senderId }] } })
    ]);

    if (blockCheck) return { canChat: false, reason: 'BLOCKED' };

    // TEMEL KURAL: Karşı taraf gizliyse ve ben takip etmiyorsam MESAJ ATAMAM.
    const isFriend = !!iFollowThem;
    let canChat = !receiver?.isPrivate || isFriend;

    // Eğer zaten kabul edilmiş bir sohbet varsa devam edebilirler.
    if (conversationId) {
      const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
      if (conv?.isAccepted && !conv.isRejected) canChat = true;
    }

    return { canChat, isFriend };
  }

  async getOrCreateConversation(userId: number, targetUserId: number, fromSpot: boolean = false) {
    const auth = await this.canUserChatMessage(userId, targetUserId);

    // Gizli hesap koruması: Takip yoksa ve Spot değilse ASLA oluşturma.
    if (!auth.canChat && !fromSpot) {
      return { id: 0, canChat: false, otherParticipant: await this.prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true } }) };
    }

    let existing = await this.prisma.conversation.findFirst({
      where: { AND: [{ participants: { some: { userId } } }, { participants: { some: { userId: targetUserId } } }] },
      include: { participants: true, messages: { take: 1, orderBy: { createdAt: 'asc' } } }
    });

    if (!existing) {
      const targetFollowsMe = await this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: targetUserId, followingId: userId } } });
      
      existing = await this.prisma.conversation.create({
        data: {
          isAccepted: !!targetFollowsMe, // Beni takip ediyorsa direkt kutu, etmiyorsa istek.
          isRejected: false,
          participants: { create: [{ userId }, { userId: targetUserId }] }
        },
        include: { participants: true, messages: { take: 1, orderBy: { createdAt: 'asc' } } }
      });
    } else if (fromSpot && existing.isRejected) {
      existing = await this.prisma.conversation.update({ where: { id: existing.id }, data: { isRejected: false, isAccepted: false }, include: { participants: true, messages: { take: 1, orderBy: { createdAt: 'asc' } } } });
    }

    const myParticipantData = existing.participants.find(p => p.userId === userId);
    return { 
      ...existing, 
      themeColor: myParticipantData?.themeColor || '#4f46e5', 
      otherParticipant: await this.prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true } }),
      canChat: true 
    };
  }

  async sendMessage(senderId: number, conversationId: number, content: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true, messages: { take: 1, orderBy: { createdAt: 'asc' } } } });
    if (!conversation) throw new NotFoundException();
    
    const other = conversation.participants.find(p => p.userId !== senderId);
    if (!other) throw new ForbiddenException('Sohbet katılımcısı bulunamadı.');

    const auth = await this.canUserChatMessage(senderId, other.userId, conversationId);

    // İsteklerde sadece ilk atan yazabilir
    if (!conversation.isAccepted && conversation.messages.length > 0 && conversation.messages[0].senderId !== senderId) {
      throw new ForbiddenException('Önce isteği kabul etmelisiniz.');
    }

    if (!auth.canChat && !conversation.isAccepted) { /* Spot durumu */ }
    else if (!auth.canChat) throw new ForbiddenException('Kısıtlı hesap.');

    // Otomatik onay
    if (!conversation.isAccepted && conversation.messages.length > 0 && conversation.messages[0].senderId !== senderId) {
      await this.prisma.conversation.update({ where: { id: conversationId }, data: { isAccepted: true } });
    }

    return this.prisma.message.create({ data: { content, senderId, conversationId }, include: { sender: { select: { id: true, username: true, avatarUrl: true } } } });
  }

  async getUserConversations(userId: number) {
    const participantEntries = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: { where: { NOT: { userId } }, include: { user: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true } } } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 }
          }
        }
      }
    });

    return participantEntries.map((entry: any) => ({
      id: entry.conversation.id,
      isAccepted: entry.conversation.isAccepted,
      isRejected: entry.conversation.isRejected,
      otherParticipant: entry.conversation.participants[0]?.user,
      lastMessage: entry.conversation.messages[0],
      themeColor: entry.themeColor || '#4f46e5'
    })).filter(c => c.otherParticipant).sort((a, b) => (b.lastMessage?.createdAt.getTime() || 0) - (a.lastMessage?.createdAt.getTime() || 0));
  }

  async acceptRequest(userId: number, conversationId: number) { return this.prisma.conversation.update({ where: { id: conversationId }, data: { isAccepted: true, isRejected: false } }); }
  async rejectRequest(userId: number, conversationId: number) { return this.prisma.conversation.update({ where: { id: conversationId }, data: { isAccepted: false, isRejected: true } }); }
  async getMessages(conversationId: number) { return this.prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, username: true, avatarUrl: true } } } }); }
  async markAsRead(userId: number, conversationId: number) { return this.prisma.message.updateMany({ where: { conversationId, senderId: { not: userId }, isRead: false }, data: { isRead: true } }); }
  async deleteConversation(userId: number, conversationId: number) { return this.prisma.conversation.delete({ where: { id: conversationId } }); }
  async updateThemeColor(userId: number, conversationId: number, color: string) { return (this.prisma.conversationParticipant as any).update({ where: { conversationId_userId: { conversationId, userId } }, data: { themeColor: color } }); }
}
