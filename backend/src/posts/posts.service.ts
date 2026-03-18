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
import { NotificationsService, NotificationType } from '../notifications/notifications.service';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private myLogger: MyLogger,
    private notificationsService: NotificationsService,
    private chatGateway: ChatGateway,
  ) {}

  async create(userId: number, createPostDto: CreatePostDto, files?: { image?: Express.Multer.File[], document?: Express.Multer.File[] }) {
    const { cleanText, count } = censorContent(createPostDto.content || '');
    if (count > 0) {
      this.myLogger.warn(`Kullanıcı ID: ${userId} küfürlü içerik paylaştı (${count} kelime).`, 'Security');
    }

    const isReply = !!createPostDto.parentId;
    const shouldIdentifyCategory = !createPostDto.categoryId && !isReply;
    const aiAnalysis = await this.aiService.analyzePost(cleanText, shouldIdentifyCategory);

    let categoryId = createPostDto.categoryId;

    if (shouldIdentifyCategory && !categoryId && aiAnalysis.suggestedCategorySlug) {
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
    let documentUrl: string | null = null;

    if (files?.image?.[0]) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'posts');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `post-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      const filePath = path.join(uploadDir, fileName);

      try {
        await sharp(files.image[0].buffer)
          .resize(1200, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(filePath);
        imageUrl = `/uploads/posts/${fileName}`;
      } catch (error) {
        this.myLogger.error(`Görsel işleme hatası: ${error.message}`, error.stack, 'PostsService');
      }
    }

    if (files?.document?.[0]) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const originalName = Buffer.from(files.document[0].originalname, 'latin1').toString('utf8');
      const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const fileName = `doc-${Date.now()}-${safeName}`;
      const filePath = path.join(uploadDir, fileName);

      try {
        fs.writeFileSync(filePath, files.document[0].buffer);
        documentUrl = `/uploads/documents/${fileName}`;
      } catch (error) {
        this.myLogger.error(`Döküman işleme hatası: ${error.message}`, error.stack, 'PostsService');
      }
    }

    // Role check for Academic posts
    let isAcademic = String(createPostDto.isAcademic) === 'true';
    if (isAcademic) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN' && user?.role !== 'ACADEMIC') {
        isAcademic = false; // Override if not allowed
      }
    }

    const post = await this.prisma.post.create({
      data: {
        content: cleanText,
        imageUrl: imageUrl,
        documentUrl: documentUrl,
        isAcademic: isAcademic,
        published: createPostDto.published ?? true,
        authorId: userId,
        categoryId: categoryId ? Number(categoryId) : undefined,
        parentId: createPostDto.parentId ? Number(createPostDto.parentId) : null,
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

    // BİLDİRİM: Eğer bu bir yanıtsa, ana postun sahibine haber ver
    if (createPostDto.parentId) {
      const parentIdNum = Number(createPostDto.parentId);
      const parentPost = await this.prisma.post.findUnique({
        where: { id: parentIdNum },
        select: { authorId: true },
      });

      if (parentPost && parentPost.authorId !== userId) {
        await this.notificationsService.createNotification(
          NotificationType.COMMENT,
          parentPost.authorId,
          userId,
          parentIdNum,
        );
      }
    }

    // YENİ: Gerçek Zamanlı Akış İçin Yayınla (Sadece ana postları veya akademik duyuruları)
    if (!createPostDto.parentId) {
      this.chatGateway.broadcastNewPost(post);
    }

    return post;
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

    // BİLDİRİM: Repost edilen postun sahibine haber ver
    if (newRepost.repostOf && newRepost.repostOf.authorId !== userId) {
      await this.notificationsService.createNotification(
        NotificationType.REPOST,
        newRepost.repostOf.authorId,
        userId,
        postId
      );
    }

    // YENİ: Repostu da akışa anlık düşür
    this.chatGateway.broadcastNewPost(newRepost);

    return { reposted: true, post: newRepost, message: 'Remakülendi!' };
  }

  async findAll(userId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { 
        published: true,
        isDeleted: false,
        parentId: null,
        isAcademic: false, // Sadece normal akış
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

  async findAcademicFeed(userId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { 
        published: true,
        isDeleted: false,
        parentId: null,
        isAcademic: true, // Sadece akademik akış
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
        category: true,
        _count: { select: { likes: true, reposts: { where: { isDeleted: false } }, replies: { where: { isDeleted: false } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapInteractionStatus(posts, userId);
  }

  async findBookmarks(userId: number) {
    const bookmarks = await this.prisma.bookmark.findMany({
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
    
    const posts = bookmarks.map(b => b.post);
    return this.mapInteractionStatus(posts, userId);
  }

  async toggleBookmark(userId: number, postId: number) {
    const existingBookmark = await this.prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingBookmark) {
      await this.prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      return { bookmarked: false, message: 'Kaydedilenlerden çıkarıldı.' };
    }

    await this.prisma.bookmark.create({
      data: { userId, postId },
    });
    return { bookmarked: true, message: 'Kaydedildi!' };
  }

  async findByCategory(categoryId: number, userId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { 
        categoryId, 
        published: true,
        isDeleted: false,
        parentId: null, // Sadece ana postlar
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
    const [userLikes, userReposts, userBookmarks] = await Promise.all([
      this.prisma.like.findMany({ where: { userId }, select: { postId: true } }),
      this.prisma.post.findMany({ where: { authorId: userId, NOT: { repostId: null }, isDeleted: false }, select: { repostId: true } }),
      this.prisma.bookmark.findMany({ where: { userId }, select: { postId: true } })
    ]);
    const likedPostIds = new Set(userLikes.map((l) => l.postId));
    const repostedPostIds = new Set(userReposts.map((r) => r.repostId));
    const bookmarkedPostIds = new Set(userBookmarks.map((b) => b.postId));
    
    return posts.map((p) => {
      const targetId = p.repostId || p.id;
      return { 
        ...p, 
        isLiked: likedPostIds.has(targetId), 
        isReposted: repostedPostIds.has(targetId),
        isBookmarked: bookmarkedPostIds.has(targetId)
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
    let isBookmarked = false;
    
    if (currentUserId) {
      const targetId = post.repostId || post.id;
      const [like, repost, bookmark] = await Promise.all([
        this.prisma.like.findUnique({ where: { userId_postId: { userId: currentUserId, postId: targetId } } }),
        this.prisma.post.findFirst({ where: { authorId: currentUserId, repostId: targetId, isDeleted: false } }),
        this.prisma.bookmark.findUnique({ where: { userId_postId: { userId: currentUserId, postId: targetId } } })
      ]);
      isLiked = !!like;
      isReposted = !!repost;
      isBookmarked = !!bookmark;
    }
    return { ...post, isLiked, isReposted, isBookmarked };
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
        orderBy: { createdAt: 'desc' },
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
