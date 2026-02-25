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

    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
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
        data: { userId, postId },
      });

      // Bildirim oluştur (post sahibine)
      await this.notificationsService.createNotification(
        NotificationType.LIKE,
        post.authorId,
        userId,
        postId,
      );

      return { liked: true, message: 'Post beğenildi.' };
    }
  }

  async getPostLikes(postId: number) {
    const count = await this.prisma.like.count({
      where: { postId },
    });
    return { postId, likes: count };
  }

  async isLikedByUser(userId: number, postId: number) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });
    return { liked: !!like };
  }
}
