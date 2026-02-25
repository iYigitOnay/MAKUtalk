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
          select: { id: true, username: true, fullName: true, avatarUrl: true },
        },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: true,
            _count: { select: { likes: true, comments: true, reposts: true } }
          }
        },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
    });
  }

  // Repost İşlemi (Remakü)
  async toggleRepost(userId: number, postId: number) {
    // Önce bu post zaten repost edilmiş mi kontrol et
    const existingRepost = await this.prisma.post.findFirst({
      where: {
        authorId: userId,
        repostId: postId,
      },
    });

    if (existingRepost) {
      // Eğer varsa sil (Un-repost)
      await this.prisma.post.delete({ where: { id: existingRepost.id } });
      return { reposted: false, message: 'Remakü geri alındı.' };
    }

    // Yoksa yeni bir repost oluştur
    const newRepost = await this.prisma.post.create({
      data: {
        authorId: userId,
        repostId: postId,
        published: true,
      },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatarUrl: true },
        },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: true,
            _count: { select: { likes: true, comments: true, reposts: true } }
          }
        },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
    });

    return { reposted: true, post: newRepost, message: 'Remakülendi!' };
  }

  // Tüm postları listele
  async findAll(userId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { published: true },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: true,
            _count: { select: { likes: true, comments: true, reposts: true } }
          }
        },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.mapInteractionStatus(posts, userId);
  }

  // Kategoriye göre postlar
  async findByCategory(categoryId: number, userId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { categoryId, published: true },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: true,
            _count: { select: { likes: true, comments: true, reposts: true } }
          }
        },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.mapInteractionStatus(posts, userId);
  }

  // Kullanıcının kendi postları
  async findMyPosts(userId: number) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: true,
            _count: { select: { likes: true, comments: true, reposts: true } }
          }
        },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.mapInteractionStatus(posts, userId);
  }

  // Kullanıcının repostlarını getir (Remakü Sekmesi için)
  async findUserReposts(userId: number, currentUserId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId, NOT: { repostId: null } },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: true,
            _count: { select: { likes: true, comments: true, reposts: true } }
          }
        },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.mapInteractionStatus(posts, currentUserId || userId);
  }

  // Ortak fonksiyon: Beğeni ve Repost durumlarını işaretle
  private async mapInteractionStatus(posts: any[], userId?: number) {
    if (!userId) return posts;

    const [userLikes, userReposts] = await Promise.all([
      this.prisma.like.findMany({ where: { userId }, select: { postId: true } }),
      this.prisma.post.findMany({ where: { authorId: userId, NOT: { repostId: null } }, select: { repostId: true } })
    ]);
    
    const likedPostIds = new Set(userLikes.map((like) => like.postId));
    const repostedPostIds = new Set(userReposts.map((r) => r.repostId));

    return posts.map((post) => {
      const targetId = post.repostId || post.id;
      return {
        ...post,
        isLiked: likedPostIds.has(targetId),
        isReposted: repostedPostIds.has(targetId),
      };
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
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: true,
            _count: { select: { likes: true, comments: true, reposts: true } }
          }
        },
        _count: {
          select: { likes: true, comments: true, reposts: true },
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
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: true,
            _count: { select: { likes: true, comments: true, reposts: true } }
          }
        },
        _count: { select: { likes: true, comments: true, reposts: true } },
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
