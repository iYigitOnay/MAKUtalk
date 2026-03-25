import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';
import { SnowflakeService } from '../common/snowflake/snowflake.service';

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
    private snowflakeService: SnowflakeService,
  ) {}

  async createNotification(
    type: NotificationType,
    recipientId: bigint,
    senderId: bigint,
    postId?: bigint,
    commentId?: bigint,
  ) {
    if (recipientId === senderId) return null;

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
        id: this.snowflakeService.getNextId(), // SNOWFLAKE ID
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

    if (this.chatGateway.server) {
      const room = `user_${recipientId.toString()}`;
      this.chatGateway.server.to(room).emit('new_notification', newNotification);
      console.log(`🚀 [Notifications] Bildirim gönderildi: Tip=${type}, AlıcıRoom=${room}, GönderenID=${senderId.toString()}`);
    } else {
      console.error('❌ [Notifications] Hata: ChatGateway server hazır değil!');
    }

    return newNotification;
  }

  async getUserNotifications(userId: bigint, limit = 20) {
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

  async getUnreadCount(userId: bigint) {
    return this.prisma.notification.count({
      where: {
        recipientId: userId,
        read: false,
      },
    });
  }

  async markAsRead(notificationId: bigint, userId: bigint) {
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

  async markAllAsRead(userId: bigint) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        read: false,
      },
      data: { read: true },
    });
  }

  async deleteNotification(notificationId: bigint, userId: bigint) {
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
