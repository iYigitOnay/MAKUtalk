import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  NotificationsService,
  NotificationType,
} from '../notifications/notifications.service';
import { censorContent } from '../common/utils/content-filter.util';
import { MyLogger } from '../common/logger/logger.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private myLogger: MyLogger,
  ) {}

  async create(
    userId: number,
    postId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, isDeleted: false },
    });
    if (!post) throw new NotFoundException('Post bulunamadı.');

    // 1. KÜFÜR FİLTRESİ
    const { cleanText, count } = censorContent(createCommentDto.content);
    if (count > 0) {
      this.myLogger.warn(
        `Kullanıcı ID: ${userId} yorumda küfür kullandı (${count} kelime).`,
        'Security',
      );
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: cleanText,
        userId,
        postId,
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatarUrl: true },
        },
      },
    });

    await this.notificationsService.createNotification(
      NotificationType.COMMENT,
      post.authorId,
      userId,
      postId,
    );

    // ETİKETLEME (MENTION) SİSTEMİ
    const mentionRegex = /@(\w+)/g;
    const matches = [...cleanText.matchAll(mentionRegex)];
    const mentionedUsernames = [...new Set(matches.map((match) => match[1]))];

    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await this.prisma.user.findMany({
        where: {
          username: { in: mentionedUsernames },
          id: { not: userId },
        },
        select: { id: true, username: true },
      });

      for (const mentionedUser of mentionedUsers) {
        if (mentionedUser.id !== post.authorId) {
          await this.notificationsService.createNotification(
            NotificationType.MENTION,
            mentionedUser.id,
            userId,
            postId,
          );
        }
      }
    }

    const { user, ...rest } = comment;
    return { ...rest, author: user };
  }

  async findByPost(postId: number) {
    const comments = await this.prisma.comment.findMany({
      where: { postId, isDeleted: false },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return comments.map(({ user, ...rest }) => ({ ...rest, author: user }));
  }

  async remove(commentId: number, userId: number) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) throw new NotFoundException('Yorum bulunamadı.');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isAdmin =
      user?.role === 'ADMIN' ||
      user?.email === '2312101063@ogr.mehmetakif.edu.tr';

    if (comment.userId !== userId && !isAdmin)
      throw new ForbiddenException('Bu yorumu silme yetkiniz yok.');

    // SOFT DELETE
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });

    this.myLogger.log(
      `Comment Soft-Deleted: ID ${commentId} by User ${userId}`,
      'Security',
    );
    return { message: 'Yorum silindi.' };
  }
}
