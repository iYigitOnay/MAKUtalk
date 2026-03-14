import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AiService } from '../ai/ai.service';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { censorContent } from '../common/utils/content-filter.util';
import { MyLogger } from '../common/logger/logger.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private myLogger: MyLogger,
  ) {}

  async create(userId: number, createPostDto: CreatePostDto, file?: Express.Multer.File) {
    const { cleanText, count } = censorContent(createPostDto.content || '');
    if (count > 0) {
      this.myLogger.warn(`Kullanıcı ID: ${userId} küfürlü içerik paylaştı (${count} kelime).`, 'Security');
    }

    const shouldIdentifyCategory = !createPostDto.categoryId;
    const aiAnalysis = await this.aiService.analyzePost(cleanText, shouldIdentifyCategory);

    let categoryId = createPostDto.categoryId;

    if (!categoryId && aiAnalysis.suggestedCategorySlug) {
      const suggestedCategory = await this.prisma.category.findUnique({ 
        where: { slug: aiAnalysis.suggestedCategorySlug.toLowerCase().trim() } 
      });
      categoryId = suggestedCategory?.id;
    }

    if (!categoryId) {
      const generalCategory = await this.prisma.category.findUnique({ where: { slug: 'genel' } });
      categoryId = generalCategory?.id || 1;
    }

    let imageUrl: string | null = null;
    if (file) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'posts');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `post-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      const filePath = path.join(uploadDir, fileName);

      try {
        await sharp(file.buffer)
          .resize(1200, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(filePath);
        imageUrl = `/uploads/posts/${fileName}`;
      } catch (error) {
        this.myLogger.error(`Görsel işleme hatası: ${error.message}`, error.stack, 'PostsService');
      }
    }

    return this.prisma.post.create({
      data: {
        content: cleanText,
        imageUrl: imageUrl,
        published: createPostDto.published ?? true,
        authorId: userId,
        categoryId: categoryId,
        parentId: createPostDto.parentId || null,
        sentiment: aiAnalysis.sentiment,
        sentimentScore: aiAnalysis.sentimentScore,
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } }
          }
        },
        _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
      },
    });
  }

  async toggleRepost(userId: number, postId: number) {
    const existingRepost = await this.prisma.post.findFirst({
      where: { authorId: userId, repostId: postId, isDeleted: false },
    });
    if (existingRepost) {
      await this.prisma.post.update({
        where: { id: existingRepost.id },
        data: { isDeleted: true },
      });
      return { reposted: false, message: 'Remakü geri alındı.' };
    }
    const newRepost = await this.prisma.post.create({
      data: { authorId: userId, repostId: postId, published: true, isDeleted: false },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
          }
        },
        _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
      },
    });
    return { reposted: true, post: newRepost, message: 'Remakülendi!' };
  }

  async findAll(userId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { 
        published: true,
        isDeleted: false,
        parentId: null,
        OR: [
          { author: { isPrivate: false } },
          { authorId: userId },
          { author: { followers: { some: { followerId: userId } } } }
        ]
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } }
          }
        },
        _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
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
        isDeleted: false,
        OR: [
          { author: { isPrivate: false } },
          { authorId: userId },
          { author: { followers: { some: { followerId: userId } } } }
        ]
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } }
          }
        },
        _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapInteractionStatus(posts, userId);
  }

  async findMyPosts(userId: number) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId, isDeleted: false, parentId: null },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } }
          }
        },
        _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapInteractionStatus(posts, userId);
  }

  async getUserPosts(userId: number, currentUserId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId, published: true, repostId: null, parentId: null, isDeleted: false },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } }
          }
        },
        _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapInteractionStatus(posts, currentUserId);
  }

  async getUserReplies(userId: number, currentUserId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId, published: true, NOT: { parentId: null }, isDeleted: false },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        parent: {
          include: {
            author: { select: { username: true } }
          }
        },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } }
          }
        },
        _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapInteractionStatus(posts, currentUserId);
  }

  async findUserReposts(userId: number, currentUserId?: number) {
    const targetUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (targetUser?.isPrivate && userId !== currentUserId) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId || 0, followingId: userId } }
      });
      if (!isFollowing) return [];
    }

    const posts = await this.prisma.post.findMany({
      where: { 
        authorId: userId, 
        NOT: { repostId: null }, 
        isDeleted: false,
        repostOf: { isDeleted: false }
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } }
          }
        },
        _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapInteractionStatus(posts, currentUserId);
  }

  async findLikedPosts(userId: number, currentUserId?: number) {
    const targetUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (targetUser?.isPrivate && userId !== currentUserId) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId || 0, followingId: userId } }
      });
      if (!isFollowing) return [];
    }

    const likes = await this.prisma.like.findMany({
      where: { userId, post: { isDeleted: false } },
      include: {
        post: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            repostOf: {
              include: {
                author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
                category: true,
                _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
              }
            },
            _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const posts = likes.map(l => l.post);
    return this.mapInteractionStatus(posts, currentUserId);
  }

  private async mapInteractionStatus(posts: any[], userId?: number) {
    if (!userId) return posts;
    const [userLikes, userReposts] = await Promise.all([
      this.prisma.like.findMany({ where: { userId }, select: { postId: true } }),
      this.prisma.post.findMany({ where: { authorId: userId, NOT: { repostId: null }, isDeleted: false }, select: { repostId: true } })
    ]);
    const likedPostIds = new Set(userLikes.map((l) => l.postId));
    const repostedPostIds = new Set(userReposts.map((r) => r.repostId));
    
    return posts.map((p) => {
      // Eğer bu post bir repost ise, orijinal postun etkileşim durumuna bak
      // Eğer bu bir ana post ise, kendi ID'sine bak
      const targetId = p.repostId || p.id;
      return { 
        ...p, 
        isLiked: likedPostIds.has(targetId), 
        isReposted: repostedPostIds.has(targetId) 
      };
    });
  }

  async findOne(id: number, currentUserId?: number) {
    const post = await this.prisma.post.findFirst({
      where: { id, isDeleted: false },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } }
          }
        },
        _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
      },
    });
    if (!post) return null;

    if (post.author.isPrivate && post.authorId !== currentUserId) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId || 0, followingId: post.authorId } }
      });
      if (!isFollowing) throw new ForbiddenException('Gizli gönderi.');
    }

    let isLiked = false;
    let isReposted = false;
    
    if (currentUserId) {
      const targetId = post.repostId || post.id;
      const [like, repost] = await Promise.all([
        this.prisma.like.findUnique({ where: { userId_postId: { userId: currentUserId, postId: targetId } } }),
        this.prisma.post.findFirst({ where: { authorId: currentUserId, repostId: targetId, isDeleted: false } })
      ]);
      isLiked = !!like;
      isReposted = !!repost;
    }
    return { ...post, isLiked, isReposted };
  }

  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findFirst({ where: { id, isDeleted: false } });
    if (!post) throw new NotFoundException('Post bulunamadı.');
    if (post.authorId !== userId) throw new ForbiddenException('Yetkiniz yok.');

    const { cleanText, count } = censorContent(updatePostDto.content || '');
    if (count > 0) this.myLogger.warn(`Kullanıcı ID: ${userId} postunu küfürle güncelledi.`, 'Security');

    return this.prisma.post.update({
      where: { id },
      data: { ...updatePostDto, content: cleanText },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } }
          }
        },
        _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
      },
    });
  }

  async remove(id: number, userId: number) {
    const post = await this.prisma.post.findFirst({ where: { id, isDeleted: false } });
    if (!post) throw new NotFoundException('Post bulunamadı.');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN' || user?.email === '2312101063@ogr.mehmetakif.edu.tr';

    if (post.authorId !== userId && !isAdmin) throw new ForbiddenException('Yetkiniz yok.');

    await this.prisma.post.update({ where: { id }, data: { isDeleted: true } });
    this.myLogger.log(`Post Soft-Deleted: ID ${id} by User ${userId}`, 'Security');
    return { message: 'Post başarıyla silindi.' };
  }

  async refreshSentiment(id: number, userId: number) {
    const post = await this.prisma.post.findFirst({ where: { id, isDeleted: false } });
    if (!post) throw new NotFoundException('Post bulunamadı.');

    const aiAnalysis = await this.aiService.analyzePost(post.content || '', false);

    return this.prisma.post.update({
      where: { id },
      data: { sentiment: aiAnalysis.sentiment, sentimentScore: aiAnalysis.sentimentScore },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
      },
    });
  }

  async getThread(id: number, currentUserId?: number) {
    try {
      const post = await this.findOne(id, currentUserId);
      if (!post) throw new NotFoundException('Post bulunamadı.');

      // Üst postları (Ancestors) bul - Hata korumalı
      const parents: any[] = [];
      let currentParentId = (post as any).parentId;
      
      while (currentParentId) {
        try {
          const parent = await this.findOne(currentParentId, currentUserId);
          if (!parent) break;
          parents.unshift(parent);
          currentParentId = (parent as any).parentId;
          if (parents.length > 10) break; 
        } catch {
          break; 
        }
      }

      // Alt cevapları (Replies) bul
      const replies = await this.prisma.post.findMany({
        where: { parentId: id, isDeleted: false },
        include: {
          author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
          category: true,
          repostOf: {
            include: {
              author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
              category: true,
              _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } }
            }
          },
          _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
        },
        orderBy: { createdAt: 'asc' },
      });

      const mappedReplies = await this.mapInteractionStatus(replies, currentUserId);

      return {
        parents,
        post,
        replies: mappedReplies,
      };
    } catch (error) {
      this.myLogger.error(`Thread fetch error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
