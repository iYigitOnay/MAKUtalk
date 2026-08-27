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
import { SnowflakeService } from '../common/snowflake/snowflake.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private myLogger: MyLogger,
    private snowflakeService: SnowflakeService,
  ) {}

  async create(
    userId: bigint,
    postId: bigint,
    createCommentDto: CreateCommentDto,
  ) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, isDeleted: false },
    });
    if (!post) throw new NotFoundException('Post bulunamadı.');

    const { cleanText, count } = censorContent(createCommentDto.content);
    if (count > 0) {
      this.myLogger.warn(
        `Kullanıcı ID: ${userId} yorumda küfür kullandı (${count} kelime).`,
        'Security',
      );
    }

    const comment = await this.prisma.comment.create({
      data: {
        id: this.snowflakeService.getNextId(), // SNOWFLAKE ID
        content: cleanText,
        userId,
        postId,
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true },
        },
      },
    });

    const notification = await this.notificationsService.createNotification(
      NotificationType.COMMENT,
      post.authorId,
      userId,
      postId,
      comment.id, 
    );
    
    if (notification) {
      this.myLogger.log(`✅ [Comments] Bildirim oluşturuldu: ID=${notification.id}, Alıcı=${post.authorId}`, 'Notifications');
    }

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
    const commentsCount = await this.prisma.comment.count({ where: { postId, isDeleted: false } });
    
    return { ...rest, author: user, commentsCount };
  }

  async findByPost(postId: bigint, currentUserId?: bigint) {
    this.myLogger.log(`[COMMENTS] findByPost - Post: ${postId}, User: ${currentUserId}`, 'CommentsService');
    const comments = await this.prisma.comment.findMany({
      where: { postId, isDeleted: false },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Eğer kullanıcı giriş yapmışsa, takip ettiklerini bul
    let followingIds: Set<bigint> = new Set();
    if (currentUserId) {
      const follows = await this.prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      followingIds = new Set(follows.map((f) => f.followingId));
      this.myLogger.log(`[COMMENTS] Takip Edilen Sayısı: ${followingIds.size}`, 'CommentsService');
    }

    return comments.map(({ user, content, ...rest }) => {
      let finalContent = content;
      let isContentHidden = false;

      const isMe = currentUserId === user.id;
      const isFollowing = followingIds.has(user.id);

      this.myLogger.log(`[COMMENTS] Yorum Sahibi: ${user.username}, Gizli: ${user.isPrivate}, Ben miyim: ${isMe}, Takip ediyor muyum: ${isFollowing}`, 'CommentsService');

      if (user.isPrivate && !isMe && !isFollowing) {
        finalContent = '🔒 Bu yorum gizli bir hesap tarafından yapılmıştır.';
        isContentHidden = true;
      }

      return {
        ...rest,
        content: finalContent,
        isContentHidden,
        author: user,
      };
    });
  }

  async remove(commentId: bigint, userId: bigint) {
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

    const postId = comment.postId;

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });

    const commentsCount = await this.prisma.comment.count({ where: { postId, isDeleted: false } });

    this.myLogger.log(
      `Comment Soft-Deleted: ID ${commentId} by User ${userId}`,
      'Security',
    );
    return { message: 'Yorum silindi.', commentsCount, postId: postId.toString() };
  }
}
