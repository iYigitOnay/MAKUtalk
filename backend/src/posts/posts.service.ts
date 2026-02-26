import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async create(userId: number, createPostDto: CreatePostDto) {
    // Eğer kategori seçilmemişse AI kategori ve duygu analizi yapacak
    const shouldIdentifyCategory = !createPostDto.categoryId;
    const aiAnalysis = await this.aiService.analyzePost(createPostDto.content, shouldIdentifyCategory);

    let categoryId = createPostDto.categoryId;

    // AI'dan gelen slug'ı veritabanındaki ID ile eşleştir (ID karmaşasını önler)
    if (!categoryId && aiAnalysis.suggestedCategorySlug) {
      const suggestedCategory = await this.prisma.category.findUnique({ 
        where: { slug: aiAnalysis.suggestedCategorySlug.toLowerCase().trim() } 
      });
      categoryId = suggestedCategory?.id;
    }

    // Hala kategori yoksa "Genel" bul
    if (!categoryId) {
      const generalCategory = await this.prisma.category.findUnique({ where: { slug: 'genel' } });
      categoryId = generalCategory?.id || 1;
    }

    return this.prisma.post.create({
      data: {
        content: createPostDto.content,
        published: createPostDto.published ?? true,
        authorId: userId,
        categoryId: categoryId,
        sentiment: aiAnalysis.sentiment,
        sentimentScore: aiAnalysis.sentimentScore,
      },
      include: {
        author: {
          select: { 
            id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true,
            badges: { include: { badge: true } }
          },
        },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, comments: true, reposts: true } }
          }
        },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
    });
  }

  // Diğer metodlar orijinal hallerinde kalabilir...
  async toggleRepost(userId: number, postId: number) {
    const existingRepost = await this.prisma.post.findFirst({ where: { authorId: userId, repostId: postId } });
    if (existingRepost) {
      await this.prisma.post.delete({ where: { id: existingRepost.id } });
      return { reposted: false, message: 'Remakü geri alındı.' };
    }
    const newRepost = await this.prisma.post.create({
      data: { authorId: userId, repostId: postId, published: true },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, comments: true, reposts: true } }
          }
        },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
    });
    return { reposted: true, post: newRepost, message: 'Remakülendi!' };
  }

  async findAll(userId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { 
        published: true,
        OR: [
          { author: { isPrivate: false } }, // Herkese açık hesaplar
          { authorId: userId },             // Kendi postları
          { 
            author: { 
              followers: { 
                some: { followerId: userId } // Takip ettiği gizli hesaplar
              } 
            } 
          }
        ]
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
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

  async findByCategory(categoryId: number, userId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { 
        categoryId, 
        published: true,
        OR: [
          { author: { isPrivate: false } },
          { authorId: userId },
          { 
            author: { 
              followers: { 
                some: { followerId: userId } 
              } 
            } 
          }
        ]
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
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

  async findMyPosts(userId: number) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
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

  async findUserReposts(userId: number, currentUserId?: number) {
    // Profil sahibinin gizlilik kontrolü
    const targetUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (targetUser?.isPrivate && userId !== currentUserId) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId || 0, followingId: userId } }
      });
      if (!isFollowing) return [];
    }

    const posts = await this.prisma.post.findMany({
      where: { authorId: userId, NOT: { repostId: null } },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
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

  async findLikedPosts(userId: number, currentUserId?: number) {
    // Profil sahibinin gizlilik kontrolü
    const targetUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (targetUser?.isPrivate && userId !== currentUserId) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId || 0, followingId: userId } }
      });
      if (!isFollowing) return [];
    }

    const likes = await this.prisma.like.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            repostOf: {
              include: {
                author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
                category: true,
                _count: { select: { likes: true, comments: true, reposts: true } }
              }
            },
            _count: { select: { likes: true, comments: true, reposts: true } },
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const posts = likes.map(l => l.post);
    return this.mapInteractionStatus(posts, currentUserId || userId);
  }

  private async mapInteractionStatus(posts: any[], userId?: number) {
    if (!userId) return posts;
    const [userLikes, userReposts] = await Promise.all([
      this.prisma.like.findMany({ where: { userId }, select: { postId: true } }),
      this.prisma.post.findMany({ where: { authorId: userId, NOT: { repostId: null } }, select: { repostId: true } })
    ]);
    const likedPostIds = new Set(userLikes.map((l) => l.postId));
    const repostedPostIds = new Set(userReposts.map((r) => r.repostId));
    return posts.map((p) => {
      const targetId = p.repostId || p.id;
      return { ...p, isLiked: likedPostIds.has(targetId), isReposted: repostedPostIds.has(targetId) };
    });
  }

  async findOne(id: number, currentUserId?: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, comments: true, reposts: true } }
          }
        },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
    });
    if (!post) return null;

    // Gizlilik kontrolü
    if (post.author.isPrivate && post.authorId !== currentUserId) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId || 0, followingId: post.authorId } }
      });
      if (!isFollowing) {
        throw new ForbiddenException('Bu gönderiyi görüntüleme yetkiniz yok. Kullanıcı gizli.');
      }
    }

    let isLiked = false;
    if (currentUserId) {
      const like = await this.prisma.like.findUnique({ where: { userId_postId: { userId: currentUserId, postId: id } } });
      isLiked = !!like;
    }
    return { ...post, isLiked };
  }

  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post bulunamadı.');
    if (post.authorId !== userId) throw new ForbiddenException('Bu postu düzenleme yetkiniz yok.');
    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
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
    if (post.authorId !== userId) throw new ForbiddenException('Bu postu silme yetkiniz yok.');
    await this.prisma.post.delete({ where: { id } });
    return { message: 'Post başarıyla silindi.' };
  }
}
