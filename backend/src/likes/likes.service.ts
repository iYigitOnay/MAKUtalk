import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationsService,
  NotificationType,
} from '../notifications/notifications.service';
import { SnowflakeService } from '../common/snowflake/snowflake.service';

@Injectable()
export class LikesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private snowflakeService: SnowflakeService,
  ) {}

  async likePost(userId: bigint, postId: bigint) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post bulunamadı.');
    }

    // Twitter Mantığı: Repost beğendiğinde orijinal post beğenilir
    const targetPostId = post.repostId || post.id;

    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId: targetPostId },
      },
    });

    if (existingLike) {
      // Unlike
      await this.prisma.like.delete({
        where: { id: existingLike.id },
      });

      // Get updated count
      const count = await this.prisma.like.count({
        where: { postId: targetPostId },
      });

      // Broadcast unlike event
      const targetPost = await this.prisma.post.findUnique({
        where: { id: targetPostId },
      });
      if (targetPost) {
        await this.notificationsService.broadcastUnlike(
          targetPostId,
          userId,
          targetPost.authorId,
          count,
        );
      }

      return {
        liked: false,
        count,
        targetPostId: targetPostId.toString(),
        message: 'Beğeni kaldırıldı.',
      };
    } else {
      // Like
      await this.prisma.like.create({
        data: {
          id: this.snowflakeService.getNextId(), // SNOWFLAKE ID
          userId,
          postId: targetPostId,
        },
      });

      // Get updated count
      const count = await this.prisma.like.count({
        where: { postId: targetPostId },
      });

      // Bildirim oluştur (orijinal post sahibine)
      const targetPost = await this.prisma.post.findUnique({
        where: { id: targetPostId },
      });
      if (targetPost && targetPost.authorId !== userId) {
        await this.notificationsService.createNotification(
          NotificationType.LIKE,
          targetPost.authorId,
          userId,
          targetPostId,
        );

        // Broadcast like event
        await this.notificationsService.broadcastLike(
          targetPostId,
          userId,
          targetPost.authorId,
          count,
        );
      }

      return {
        liked: true,
        count,
        targetPostId: targetPostId.toString(),
        message: 'Post beğenildi.',
      };
    }
  }

  async getPostLikes(postId: bigint) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    const targetId = post?.repostId || postId;
    const count = await this.prisma.like.count({
      where: { postId: targetId },
    });
    return { postId: targetId, likes: count };
  }

  async isLikedByUser(userId: bigint, postId: bigint) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    const targetId = post?.repostId || postId;
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId: targetId },
      },
    });
    return { liked: !!like };
  }
}
