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
    if (comment.userId !== userId)
      throw new ForbiddenException('Bu yorumu silme yetkiniz yok.');

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Yorum silindi.' };
  }
}
