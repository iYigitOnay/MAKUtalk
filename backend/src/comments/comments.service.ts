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

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    userId: number,
    postId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post bulunamadı.');

    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
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
    const matches = [...createCommentDto.content.matchAll(mentionRegex)];
    const mentionedUsernames = [...new Set(matches.map((match) => match[1]))];

    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await this.prisma.user.findMany({
        where: {
          username: { in: mentionedUsernames },
          id: { not: userId }, // Kendini etiketleyince bildirim gitmesin
        },
        select: { id: true, username: true },
      });

      for (const mentionedUser of mentionedUsers) {
        // Eğer etiketlenen kişi post sahibi ise zaten COMMENT bildirimi gittiği için tekrar MENTION gitmesin
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

    // 'user' → 'author' olarak döndür
    const { user, ...rest } = comment;
    return { ...rest, author: user };
  }

  async findByPost(postId: number) {
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 'user' → 'author' olarak map et
    return comments.map(({ user, ...rest }) => ({ ...rest, author: user }));
  }

  async remove(commentId: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundException('Yorum bulunamadı.');

    // Kullanıcı admin mi kontrol et
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN' || user?.email === '2312101063@ogr.mehmetakif.edu.tr';

    if (comment.userId !== userId && !isAdmin)
      throw new ForbiddenException('Bu yorumu silme yetkiniz yok.');

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Yorum silindi.' };
  }
}
