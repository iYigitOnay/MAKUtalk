import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  // Post oluştur
  async create(userId: number, createPostDto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        content: createPostDto.content,
        published: createPostDto.published ?? true,
        authorId: userId,
        categoryId: createPostDto.categoryId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        category: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  // Tüm postları listele
  async findAll(userId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        category: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Eğer userId varsa, kullanıcının beğendiği postları işaretle
    if (userId) {
      const userLikes = await this.prisma.like.findMany({
        where: { userId },
        select: { postId: true },
      });
      const likedPostIds = new Set(userLikes.map((like) => like.postId));

      return posts.map((post) => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
      }));
    }

    return posts;
  }

  // Kategoriye göre postlar
  async findByCategory(categoryId: number, userId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { categoryId, published: true },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        category: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (userId) {
      const userLikes = await this.prisma.like.findMany({
        where: { userId },
        select: { postId: true },
      });
      const likedPostIds = new Set(userLikes.map((like) => like.postId));

      return posts.map((post) => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
      }));
    }

    return posts;
  }

  // Kullanıcının kendi postları
  async findMyPosts(userId: number) {
    return this.prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        category: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, currentUserId?: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        category: true,
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    if (!post) return null;

    let isLiked = false;
    if (currentUserId) {
      const like = await this.prisma.like.findUnique({
        where: {
          userId_postId: { userId: currentUserId, postId: id },
        },
      });
      isLiked = !!like;
    }

    return { ...post, isLiked };
  }

  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) throw new NotFoundException('Post bulunamadı.');
    if (post.authorId !== userId)
      throw new ForbiddenException('Bu postu düzenleme yetkiniz yok.');

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatarUrl: true },
        },
        category: true,
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async remove(id: number, userId: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) throw new NotFoundException('Post bulunamadı.');
    if (post.authorId !== userId)
      throw new ForbiddenException('Bu postu silme yetkiniz yok.');

    await this.prisma.post.delete({ where: { id } });
    return { message: 'Post başarıyla silindi.' };
  }
}
