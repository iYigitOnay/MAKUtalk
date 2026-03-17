import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  MENTION = 'MENTION',
  REPOST = 'REPOST',
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway,
  ) {}

  async createNotification(
    type: NotificationType,
    recipientId: number,
    senderId: number,
    postId?: number,
    commentId?: number,
  ) {
    if (recipientId === senderId) return null;

    // Sadece LIKE ve FOLLOW için 5 dakikalık spam korumasını uygula.
    if (type === NotificationType.LIKE || type === NotificationType.FOLLOW) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const existing = await this.prisma.notification.findFirst({
        where: {
          type,
          recipientId,
          senderId,
          postId,
          createdAt: { gte: fiveMinutesAgo },
        },
      });

      if (existing) return existing;
    }

    const newNotification = await this.prisma.notification.create({
      data: {
        type,
        recipientId,
        senderId,
        postId,
        commentId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    // SOCKET.IO ILE ANLIK BILDIRIM GONDER
    if (this.chatGateway.server) {
      const room = `user_${recipientId}`;
      this.chatGateway.server.to(room).emit('new_notification', newNotification);
      console.log(`🚀 [Notifications] Bildirim gönderildi: Tip=${type}, AlıcıRoom=${room}, GönderenID=${senderId}`);
    } else {
      console.error('❌ [Notifications] Hata: ChatGateway server hazır değil!');
    }

    return newNotification;
  }

  async getUserNotifications(userId: number, limit = 20) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUnreadCount(userId: number) {
    return this.prisma.notification.count({
      where: {
        recipientId: userId,
        read: false,
      },
    });
  }

  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: userId,
      },
    });

    if (!notification) return null;

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        read: false,
      },
      data: { read: true },
    });
  }

  async deleteNotification(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: userId,
      },
    });

    if (!notification) return null;

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }
}
