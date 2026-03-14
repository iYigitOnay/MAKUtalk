import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationsService,
  NotificationType,
} from '../notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async likePost(userId: number, postId: number) {
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
      return { liked: false, message: 'Beğeni kaldırıldı.' };
    } else {
      // Like
      await this.prisma.like.create({
        data: { userId, postId: targetPostId },
      });

      // Bildirim oluştur (orijinal post sahibine)
      const targetPost = await this.prisma.post.findUnique({ where: { id: targetPostId } });
      if (targetPost && targetPost.authorId !== userId) {
        await this.notificationsService.createNotification(
          NotificationType.LIKE,
          targetPost.authorId,
          userId,
          targetPostId,
        );
      }

      return { liked: true, message: 'Post beğenildi.' };
    }
  }

  async getPostLikes(postId: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    const targetId = post?.repostId || postId;
    const count = await this.prisma.like.count({
      where: { postId: targetId },
    });
    return { postId: targetId, likes: count };
  }

  async isLikedByUser(userId: number, postId: number) {
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
