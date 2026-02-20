import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(
    type: NotificationType,
    recipientId: number,
    senderId: number,
    postId?: number,
  ) {
    if (recipientId === senderId) return null;

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

    return this.prisma.notification.create({
      data: {
        type,
        recipientId,
        senderId,
        postId,
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
      },
    });
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
