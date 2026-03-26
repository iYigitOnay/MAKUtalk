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

  /**
   * Broadcast like event to post author when someone likes their post
   */
  async broadcastLike(
    postId: bigint,
    userId: bigint,
    postAuthorId: bigint,
    likeCount: number,
  ) {
    if (!this.chatGateway.server) return;

    const room = `user_${postAuthorId.toString()}`;
    this.chatGateway.server.to(room).emit('new_like', {
      postId: postId.toString(),
      userId: userId.toString(),
      count: likeCount,
      liked: true,
    });
  }

  /**
   * Broadcast unlike event to post author
   */
  async broadcastUnlike(
    postId: bigint,
    userId: bigint,
    postAuthorId: bigint,
    likeCount: number,
  ) {
    if (!this.chatGateway.server) return;

    const room = `user_${postAuthorId.toString()}`;
    this.chatGateway.server.to(room).emit('like_removed', {
      postId: postId.toString(),
      userId: userId.toString(),
      count: likeCount,
      liked: false,
    });
  }

  /**
   * Broadcast new comment event to post author
   */
  async broadcastNewComment(
    postId: bigint,
    commentId: bigint,
    userId: bigint,
    postAuthorId: bigint,
    commentCount: number,
  ) {
    if (!this.chatGateway.server) return;

    const room = `user_${postAuthorId.toString()}`;
    this.chatGateway.server.to(room).emit('new_comment', {
      postId: postId.toString(),
      commentId: commentId.toString(),
      userId: userId.toString(),
      count: commentCount,
    });
  }

  /**
   * Broadcast comment deleted event
   */
  async broadcastCommentDeleted(
    postId: bigint,
    commentId: bigint,
    postAuthorId: bigint,
    commentCount: number,
  ) {
    if (!this.chatGateway.server) return;

    const room = `user_${postAuthorId.toString()}`;
    this.chatGateway.server.to(room).emit('comment_deleted', {
      postId: postId.toString(),
      commentId: commentId.toString(),
      count: commentCount,
    });
  }

  /**
   * Broadcast bookmark event
   */
  async broadcastBookmark(
    postId: bigint,
    userId: bigint,
    postAuthorId: bigint,
    bookmarked: boolean,
  ) {
    if (!this.chatGateway.server) return;

    const room = `user_${postAuthorId.toString()}`;
    this.chatGateway.server.to(room).emit('bookmark_changed', {
      postId: postId.toString(),
      userId: userId.toString(),
      bookmarked,
    });
  }

  /**
   * Broadcast repost event
   */
  async broadcastRepost(
    postId: bigint,
    userId: bigint,
    postAuthorId: bigint,
    reposted: boolean,
    repostCount: number,
  ) {
    if (!this.chatGateway.server) return;

    const room = `user_${postAuthorId.toString()}`;
    this.chatGateway.server.to(room).emit('repost_changed', {
      postId: postId.toString(),
      userId: userId.toString(),
      reposted,
      count: repostCount,
    });
  }
}
