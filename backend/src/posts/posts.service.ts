import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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
import {
  NotificationsService,
  NotificationType,
} from '../notifications/notifications.service';
import { ChatGateway } from '../chat/chat.gateway';
import { SnowflakeService } from '../common/snowflake/snowflake.service';
import { MediaProcessingService } from '../common/utils/media-processing.service';
import { HashtagService } from '../hashtags/hashtag.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private myLogger: MyLogger,
    private notificationsService: NotificationsService,
    private chatGateway: ChatGateway,
    private snowflakeService: SnowflakeService,
    private mediaProcessingService: MediaProcessingService,
    private readonly hashtagService: HashtagService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    userId: bigint,
    createPostDto: CreatePostDto,
    files?: {
      image?: Express.Multer.File[];
      document?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    const { cleanText, count } = censorContent(createPostDto.content || '');
    if (count > 0) {
      this.myLogger.warn(
        `Kullanıcı ID: ${userId} küfürlü içerik paylaştı (${count} kelime).`,
        'Security',
      );
    }

    const isReply = !!createPostDto.parentId;
    const shouldIdentifyCategory = !createPostDto.categoryId && !isReply;

    let documentUrl: string | null = null;
    if (files?.document?.[0]) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      const originalName = Buffer.from(
        files.document[0].originalname,
        'latin1',
      ).toString('utf8');
      const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const fileName = `doc-${Date.now()}-${safeName}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, files.document[0].buffer);
      documentUrl = `/uploads/documents/${fileName}`;
    }

    let isAcademic = String(createPostDto.isAcademic) === 'true';
    if (isAcademic) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN' && user?.role !== 'ACADEMIC')
        isAcademic = false;
    }

    if (createPostDto.parentId) {
      const parentPost = await this.prisma.post.findUnique({
        where: { id: BigInt(createPostDto.parentId) },
        select: { id: true, isDeleted: true },
      });
      if (!parentPost || parentPost.isDeleted)
        throw new BadRequestException('Parent post bulunamadı.');
    }

    // POSTU OLUŞTUR (isProcessing: true)
    const post = await this.prisma.post.create({
      data: {
        id: this.snowflakeService.getNextId(),
        content: cleanText,
        documentUrl: documentUrl,
        isAcademic: isAcademic,
        published: createPostDto.published ?? true,
        authorId: userId,
        categoryId: createPostDto.categoryId
          ? BigInt(createPostDto.categoryId)
          : null,
        parentId: createPostDto.parentId
          ? BigInt(createPostDto.parentId)
          : null,
        isProcessing: true, // İŞLENİYOR İŞARETİ
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } },
          },
        },
        category: true,
        repostOf: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isPrivate: true,
                badges: { include: { badge: true } },
              },
            },
            category: true,
            _count: {
              select: {
                likes: true,
                reposts: { where: { isDeleted: false } },
                replies: { where: { isDeleted: false } },
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: { where: { isDeleted: false } },
            replies: { where: { isDeleted: false } },
          },
        },
      },
    });

    // BİLDİRİMLER (Senkron kalabilir, hızlıdır)
    if (createPostDto.parentId) {
      const parentPost = await this.prisma.post.findUnique({
        where: { id: BigInt(createPostDto.parentId) },
        select: { authorId: true },
      });
      if (parentPost && parentPost.authorId !== userId) {
        await this.notificationsService.createNotification(
          NotificationType.COMMENT,
          parentPost.authorId,
          userId,
          post.id,
        );
      }
    }

    // MENTION TESPİTİ (Senkron kalabilir)
    if (cleanText) {
      const mentionRegex = /@(\w+)/g;
      const matches = [...cleanText.matchAll(mentionRegex)];
      const mentionedUsernames = [...new Set(matches.map((m) => m[1]))];
      if (mentionedUsernames.length > 0) {
        const mentionedUsers = await this.prisma.user.findMany({
          where: { username: { in: mentionedUsernames }, id: { not: userId } },
          select: { id: true },
        });
        for (const targetUser of mentionedUsers) {
          this.notificationsService
            .createNotification(
              NotificationType.MENTION,
              targetUser.id,
              userId,
              post.id,
            )
            .catch(() => {});
        }
      }
    }

    // SOCKET BROADCAST (Hemen gönder!)
    if (!createPostDto.parentId) {
      this.chatGateway.broadcastNewPost(post);
    }

    // HASHTAG SENKRONİZASYONU (Hızlıdır)
    await this.hashtagService.syncHashtags(post.id, post.content);

    // --- ARKAPLAN İŞLEMLERİNİ BAŞLAT ---
    // Dosya buffer'larını kopyalayalım (Multer temizleyebilir)
    const filesToProcess = {
      image: files?.image?.map((f) => ({
        ...f,
        buffer: Buffer.from(f.buffer),
      })),
      video: files?.video?.map((f) => ({
        ...f,
        buffer: Buffer.from(f.buffer),
      })),
    };

    this.eventEmitter.emit('post.created', {
      postId: post.id,
      userId: userId,
      content: cleanText,
      files: filesToProcess,
      isReply,
      categoryId: createPostDto.categoryId,
      shouldIdentifyCategory,
    });

    return post; // KULLANICIYA HEMEN DÖN!
  }

  async toggleRepost(userId: bigint, postId: bigint) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post bulunamadı.');

    // Her zaman orijinal postu hedefle (Twitter Mantığı)
    const targetPostId = post.repostId || post.id;

    const existingRepost = await this.prisma.post.findFirst({
      where: { authorId: userId, repostId: targetPostId, isDeleted: false },
    });

    if (existingRepost) {
      await this.prisma.post.update({
        where: { id: existingRepost.id },
        data: { isDeleted: true, deletedAt: new Date() },
      });

      // Hashtag sayaçlarını düşür
      await this.hashtagService.decrementHashtagCounts(existingRepost.id);

      const count = await this.prisma.post.count({
        where: { repostId: targetPostId, isDeleted: false },
      });

      return { reposted: false, count, message: 'Remakü geri alındı.' };
    }

    const newRepost = await this.prisma.post.create({
      data: {
        id: this.snowflakeService.getNextId(), // SNOWFLAKE ID
        authorId: userId,
        repostId: targetPostId,
        published: true,
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } },
          },
        },
        category: true,
        repostOf: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isPrivate: true,
                badges: { include: { badge: true } },
              },
            },
            category: true,
            _count: {
              select: {
                likes: true,
                reposts: { where: { isDeleted: false } },
                replies: { where: { isDeleted: false } },
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: { where: { isDeleted: false } },
            replies: { where: { isDeleted: false } },
          },
        },
      },
    });

    // Bildirim oluştur (orijinal post sahibine)
    if (newRepost.repostOf && newRepost.repostOf.authorId !== userId) {
      await this.notificationsService.createNotification(
        NotificationType.REPOST,
        newRepost.repostOf.authorId,
        userId,
        targetPostId,
      );
    }

    try {
      this.chatGateway.broadcastNewPost(newRepost);
    } catch (err) {
      this.myLogger.error('Socket Broadcast Error (Repost):', err.message);
    }

    const count = await this.prisma.post.count({
      where: { repostId: targetPostId, isDeleted: false },
    });

    return { reposted: true, post: newRepost, count, message: 'Remakülendi!' };
  }

  private async getBlockedUserIds(userId?: bigint): Promise<bigint[]> {
    if (!userId) return [];
    const [blocking, blockedBy] = await Promise.all([
      this.prisma.block.findMany({
        where: { blockerId: userId },
        select: { blockedId: true },
      }),
      this.prisma.block.findMany({
        where: { blockedId: userId },
        select: { blockerId: true },
      }),
    ]);
    return [
      ...blocking.map((b) => b.blockedId),
      ...blockedBy.map((b) => b.blockerId),
    ];
  }

  async findAll(userId?: bigint) {
    const blockedIds = await this.getBlockedUserIds(userId);

    const posts = await this.prisma.post.findMany({
      where: {
        published: true,
        isDeleted: false,
        parentId: null,
        isAcademic: false,
        authorId: { notIn: blockedIds },
        OR: [
          { author: { isPrivate: false } },
          { authorId: userId },
          { author: { followers: { some: { followerId: userId } } } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } },
          },
        },
        category: true,
        repostOf: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isPrivate: true,
                badges: { include: { badge: true } },
              },
            },
            category: true,
            _count: {
              select: {
                likes: true,
                reposts: { where: { isDeleted: false } },
                replies: { where: { isDeleted: false } },
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: { where: { isDeleted: false } },
            replies: { where: { isDeleted: false } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapInteractionStatus(posts, userId);
  }

  async findAcademicFeed(userId?: bigint) {
    const blockedIds = await this.getBlockedUserIds(userId);
    const posts = await this.prisma.post.findMany({
      where: {
        published: true,
        isDeleted: false,
        parentId: null,
        isAcademic: true,
        authorId: { notIn: blockedIds },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } },
          },
        },
        category: true,
        _count: {
          select: {
            likes: true,
            reposts: { where: { isDeleted: false } },
            replies: { where: { isDeleted: false } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapInteractionStatus(posts, userId);
  }

  async findBookmarks(userId: bigint) {
    const blockedIds = await this.getBlockedUserIds(userId);
    const bookmarks = await this.prisma.bookmark.findMany({
      where: {
        userId,
        post: {
          isDeleted: false,
          authorId: { notIn: blockedIds },
        },
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isPrivate: true,
                badges: { include: { badge: true } },
              },
            },
            category: true,
            repostOf: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    fullName: true,
                    avatarUrl: true,
                    isPrivate: true,
                    badges: { include: { badge: true } },
                  },
                },
                category: true,
                _count: {
                  select: {
                    likes: true,
                    reposts: { where: { isDeleted: false } },
                    replies: { where: { isDeleted: false } },
                  },
                },
              },
            },
            _count: {
              select: {
                likes: true,
                reposts: { where: { isDeleted: false } },
                replies: { where: { isDeleted: false } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const posts = bookmarks.map((b) => b.post);
    return this.mapInteractionStatus(posts, userId);
  }

  async toggleBookmark(userId: bigint, postId: bigint) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });
    if (!post) throw new NotFoundException('Post bulunamadı.');

    // Engel kontrolü
    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: post.authorId },
          { blockerId: post.authorId, blockedId: userId },
        ],
      },
    });
    if (block)
      throw new ForbiddenException('Bu kullanıcıyla etkileşim kuramazsınız.');

    // Twitter Mantığı: Repost'un bookmark'ı orijinal post'u bookmark'lar
    const targetPostId = post.repostId || post.id;

    const existingBookmark = await this.prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId: targetPostId } },
    });

    if (existingBookmark) {
      await this.prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      return { bookmarked: false, message: 'Kaydedilenlerden çıkarıldı.' };
    }

    await this.prisma.bookmark.create({
      data: {
        id: this.snowflakeService.getNextId(), // SNOWFLAKE ID
        userId,
        postId: targetPostId,
      },
    });
    return { bookmarked: true, message: 'Kaydedildi!' };
  }

  async findByCategory(categoryId: bigint, userId?: bigint) {
    const blockedIds = await this.getBlockedUserIds(userId);
    const posts = await this.prisma.post.findMany({
      where: {
        categoryId,
        published: true,
        isDeleted: false,
        parentId: null,
        authorId: { notIn: blockedIds },
        OR: [
          { author: { isPrivate: false } },
          { authorId: userId },
          { author: { followers: { some: { followerId: userId } } } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } },
          },
        },
        category: true,
        repostOf: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isPrivate: true,
                badges: { include: { badge: true } },
              },
            },
            category: true,
            _count: {
              select: {
                likes: true,
                reposts: { where: { isDeleted: false } },
                replies: { where: { isDeleted: false } },
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: { where: { isDeleted: false } },
            replies: { where: { isDeleted: false } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapInteractionStatus(posts, userId);
  }

  async findMyPosts(userId: bigint) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId, isDeleted: false, parentId: null },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } },
          },
        },
        category: true,
        repostOf: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isPrivate: true,
                badges: { include: { badge: true } },
              },
            },
            category: true,
            _count: {
              select: {
                likes: true,
                reposts: { where: { isDeleted: false } },
                replies: { where: { isDeleted: false } },
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: { where: { isDeleted: false } },
            replies: { where: { isDeleted: false } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapInteractionStatus(posts, userId);
  }

  async getUserPosts(userId: bigint, currentUserId?: bigint) {
    const posts = await this.prisma.post.findMany({
      where: {
        authorId: userId,
        published: true,
        repostId: null,
        parentId: null,
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } },
          },
        },
        category: true,
        repostOf: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isPrivate: true,
                badges: { include: { badge: true } },
              },
            },
            category: true,
            _count: {
              select: {
                likes: true,
                reposts: { where: { isDeleted: false } },
                replies: { where: { isDeleted: false } },
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: { where: { isDeleted: false } },
            replies: { where: { isDeleted: false } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapInteractionStatus(posts, currentUserId);
  }

  async getUserReplies(userId: bigint, currentUserId?: bigint) {
    const posts = await this.prisma.post.findMany({
      where: {
        authorId: userId,
        published: true,
        NOT: { parentId: null },
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } },
          },
        },
        parent: {
          include: {
            author: { select: { username: true } },
          },
        },
        category: true,
        repostOf: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isPrivate: true,
                badges: { include: { badge: true } },
              },
            },
            category: true,
            _count: {
              select: {
                likes: true,
                reposts: { where: { isDeleted: false } },
                replies: { where: { isDeleted: false } },
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: { where: { isDeleted: false } },
            replies: { where: { isDeleted: false } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapInteractionStatus(posts, currentUserId);
  }

  async findUserReposts(userId: bigint, currentUserId?: bigint) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (targetUser?.isPrivate && userId !== currentUserId) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId || 0n,
            followingId: userId,
          },
        },
      });
      if (!isFollowing) return [];
    }

    const posts = await this.prisma.post.findMany({
      where: {
        authorId: userId,
        NOT: { repostId: null },
        isDeleted: false,
        repostOf: { isDeleted: false },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } },
          },
        },
        category: true,
        repostOf: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isPrivate: true,
                badges: { include: { badge: true } },
              },
            },
            category: true,
            _count: {
              select: {
                likes: true,
                reposts: { where: { isDeleted: false } },
                replies: { where: { isDeleted: false } },
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: { where: { isDeleted: false } },
            replies: { where: { isDeleted: false } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapInteractionStatus(posts, currentUserId);
  }

  async findLikedPosts(userId: bigint, currentUserId?: bigint) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (targetUser?.isPrivate && userId !== currentUserId) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId || 0n,
            followingId: userId,
          },
        },
      });
      if (!isFollowing) return [];
    }

    const likes = await this.prisma.like.findMany({
      where: { userId, post: { isDeleted: false } },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isPrivate: true,
                badges: { include: { badge: true } },
              },
            },
            category: true,
            repostOf: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    fullName: true,
                    avatarUrl: true,
                    isPrivate: true,
                    badges: { include: { badge: true } },
                  },
                },
                category: true,
                _count: {
                  select: {
                    likes: true,
                    reposts: { where: { isDeleted: false } },
                    replies: { where: { isDeleted: false } },
                  },
                },
              },
            },
            _count: {
              select: {
                likes: true,
                reposts: { where: { isDeleted: false } },
                replies: { where: { isDeleted: false } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const posts = likes.map((l) => l.post);
    return this.mapInteractionStatus(posts, currentUserId);
  }

  private async mapInteractionStatus(posts: any[], userId?: bigint) {
    // Takip ettiklerimizi bulalım (Gizlilik süzgeci için)
    let followingIds: Set<bigint> = new Set();
    if (userId) {
      const follows = await this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      followingIds = new Set(follows.map((f) => f.followingId));
    }

    let userLikes: { postId: bigint }[] = [];
    let userReposts: { repostId: bigint | null }[] = [];
    let userBookmarks: { postId: bigint }[] = [];

    if (userId) {
      [userLikes, userReposts, userBookmarks] = await Promise.all([
        this.prisma.like.findMany({
          where: { userId },
          select: { postId: true },
        }),
        this.prisma.post.findMany({
          where: {
            authorId: userId,
            NOT: { repostId: null },
            isDeleted: false,
          },
          select: { repostId: true },
        }),
        this.prisma.bookmark.findMany({
          where: { userId },
          select: { postId: true },
        }),
      ]);
    }

    const likedPostIds = new Set(userLikes.map((l) => l.postId));
    const repostedPostIds = new Set(userReposts.map((r) => r.repostId));
    const bookmarkedPostIds = new Set(userBookmarks.map((b) => b.postId));

    return posts.map((p) => {
      const targetId = p.repostId || p.id;
      const author = p.author;

      let content = p.content;
      let isContentHidden = false;
      let imageUrl = p.imageUrl;
      let videoUrl = p.videoUrl;

      // GLOBAL GİZLİLİK SÜZGECİ
      if (
        author &&
        author.isPrivate &&
        author.id !== userId &&
        !followingIds.has(author.id)
      ) {
        content = p.parentId
          ? '🔒 Bu yanıt gizli bir hesap tarafından yapılmıştır.'
          : '🔒 Bu gönderi gizli bir hesap tarafından yapılmıştır.';
        isContentHidden = true;
        imageUrl = null;
        videoUrl = null;
      }

      return {
        ...p,
        content,
        imageUrl,
        videoUrl,
        isContentHidden,
        isLiked: likedPostIds.has(targetId),
        isReposted: repostedPostIds.has(targetId),
        isBookmarked: bookmarkedPostIds.has(targetId),
      };
    });
  }

  async findOne(id: bigint, currentUserId?: bigint) {
    const post = await this.prisma.post.findFirst({
      where: { id, isDeleted: false },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } },
          },
        },
        category: true,
        repostOf: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isPrivate: true,
                badges: { include: { badge: true } },
              },
            },
            category: true,
            _count: {
              select: {
                likes: true,
                reposts: { where: { isDeleted: false } },
                replies: { where: { isDeleted: false } },
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: { where: { isDeleted: false } },
            replies: { where: { isDeleted: false } },
          },
        },
      },
    });
    if (!post) return null;

    // Karşılıklı Engel Kontrolü
    if (currentUserId) {
      const block = await this.prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: currentUserId, blockedId: post.authorId },
            { blockerId: post.authorId, blockedId: currentUserId },
          ],
        },
      });
      if (block) throw new NotFoundException('Post bulunamadı.');
    }

    if (post.author.isPrivate && post.authorId !== currentUserId) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId || 0n,
            followingId: post.authorId,
          },
        },
      });
      if (!isFollowing) throw new ForbiddenException('Gizli gönderi.');
    }

    let isLiked = false;
    let isReposted = false;
    let isBookmarked = false;

    if (currentUserId) {
      const targetId = post.repostId || post.id;
      const [like, repost, bookmark] = await Promise.all([
        this.prisma.like.findUnique({
          where: { userId_postId: { userId: currentUserId, postId: targetId } },
        }),
        this.prisma.post.findFirst({
          where: {
            authorId: currentUserId,
            repostId: targetId,
            isDeleted: false,
          },
        }),
        this.prisma.bookmark.findUnique({
          where: { userId_postId: { userId: currentUserId, postId: targetId } },
        }),
      ]);
      isLiked = !!like;
      isReposted = !!repost;
      isBookmarked = !!bookmark;
    }
    return { ...post, isLiked, isReposted, isBookmarked };
  }

  async update(id: bigint, userId: bigint, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findFirst({
      where: { id, isDeleted: false },
    });
    if (!post) throw new NotFoundException('Post bulunamadı.');
    if (post.authorId !== userId) throw new ForbiddenException('Yetkiniz yok.');

    const { cleanText, count } = censorContent(updatePostDto.content || '');
    if (count > 0)
      this.myLogger.warn(
        `Kullanıcı ID: ${userId} postunu küfürle güncelledi.`,
        'Security',
      );

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: { ...updatePostDto, content: cleanText },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } },
          },
        },
        category: true,
        repostOf: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isPrivate: true,
                badges: { include: { badge: true } },
              },
            },
            category: true,
            _count: {
              select: {
                likes: true,
                reposts: { where: { isDeleted: false } },
                replies: { where: { isDeleted: false } },
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: { where: { isDeleted: false } },
            replies: { where: { isDeleted: false } },
          },
        },
      },
    });

    // Hashtag senkronizasyonu
    await this.hashtagService.syncHashtags(id, cleanText);

    return updatedPost;
  }

  async togglePin(userId: bigint, id: bigint) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.isDeleted) {
      throw new NotFoundException('Post bulunamadı.');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException(
        'Sadece kendi postlarınızı sabitleyebilirsiniz.',
      );
    }

    if (post.isPinned) {
      return this.prisma.post.update({
        where: { id },
        data: { isPinned: false },
      });
    }

    await this.prisma.post.updateMany({
      where: { authorId: userId, isPinned: true },
      data: { isPinned: false },
    });

    return this.prisma.post.update({
      where: { id },
      data: { isPinned: true },
    });
  }

  async remove(id: bigint, userId: bigint) {
    const post = await this.prisma.post.findFirst({
      where: { id, isDeleted: false },
    });
    if (!post) throw new NotFoundException('Post bulunamadı.');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isAdmin =
      user?.role === 'ADMIN' ||
      user?.email === '2312101063@ogr.mehmetakif.edu.tr';

    if (post.authorId !== userId && !isAdmin)
      throw new ForbiddenException('Yetkiniz yok.');

    await this.prisma.post.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    // Hashtag sayaçlarını düşür
    await this.hashtagService.decrementHashtagCounts(id);

    this.myLogger.log(
      `Post Soft-Deleted: ID ${id} by User ${userId}`,
      'Security',
    );
    return { message: 'Post başarıyla silindi.' };
  }

  async refreshSentiment(id: bigint, userId: bigint) {
    const post = await this.prisma.post.findFirst({
      where: { id, isDeleted: false },
    });
    if (!post) throw new NotFoundException('Post bulunamadı.');

    const aiAnalysis = await this.aiService.analyzePost(
      post.content || '',
      false,
    );

    return this.prisma.post.update({
      where: { id },
      data: {
        sentiment: aiAnalysis.sentiment,
        sentimentScore: aiAnalysis.sentimentScore,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } },
          },
        },
        category: true,
        _count: {
          select: {
            likes: true,
            reposts: { where: { isDeleted: false } },
            replies: { where: { isDeleted: false } },
          },
        },
      },
    });
  }

  async refreshAI(id: bigint, userId: bigint) {
    this.myLogger.log(
      `AI Refreshing for post: ${id} by admin: ${userId}`,
      'PostsService',
    );

    const post = await this.prisma.post.findFirst({
      where: { id, isDeleted: false },
    });
    if (!post) throw new NotFoundException('Post bulunamadı.');

    // Sadece admin veya sistem sahibi yenileyebilir (admin kontrolü controller'da rol bazlı yapılabilir ama burada da garantileyebiliriz)
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN')
      throw new ForbiddenException('Bu işlem için admin yetkisi gerekir.');

    // AI'ya hem sentiment hem kategori için soralım
    const aiAnalysis = await this.aiService.analyzePost(
      post.content || '',
      true, // category identification true
    );

    this.myLogger.log(
      `AI Analysis result: ${JSON.stringify(aiAnalysis)}`,
      'PostsService',
    );

    let categoryId = post.categoryId;

    if (aiAnalysis.suggestedCategorySlug) {
      const suggestedCategory = await this.prisma.category.findUnique({
        where: { slug: aiAnalysis.suggestedCategorySlug.toLowerCase().trim() },
      });
      if (suggestedCategory) {
        categoryId = suggestedCategory.id;
      }
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        sentiment: aiAnalysis.sentiment,
        sentimentScore: aiAnalysis.sentimentScore,
        categoryId: categoryId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } },
          },
        },
        category: true,
        _count: {
          select: {
            likes: true,
            reposts: { where: { isDeleted: false } },
            replies: { where: { isDeleted: false } },
          },
        },
      },
    });
  }

  async getThread(id: bigint, currentUserId?: bigint) {
    try {
      const post = await this.findOne(id, currentUserId);
      if (!post) throw new NotFoundException('Post bulunamadı.');

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

      const replies = await this.prisma.post.findMany({
        where: { parentId: id, isDeleted: false },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isPrivate: true,
              badges: { include: { badge: true } },
            },
          },
          category: true,
          repostOf: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  avatarUrl: true,
                  isPrivate: true,
                  badges: { include: { badge: true } },
                },
              },
              category: true,
              _count: {
                select: {
                  likes: true,
                  reposts: { where: { isDeleted: false } },
                  replies: { where: { isDeleted: false } },
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              reposts: { where: { isDeleted: false } },
              replies: { where: { isDeleted: false } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Gizlilik Maskelemesi
      let followingIds: Set<bigint> = new Set();
      if (currentUserId) {
        const follows = await this.prisma.follow.findMany({
          where: { followerId: currentUserId },
          select: { followingId: true },
        });
        followingIds = new Set(follows.map((f) => f.followingId));
      }

      const mappedReplies = await this.mapInteractionStatus(
        replies,
        currentUserId,
      );

      // Yanıtları gizlilik süzgecinden geçir
      const privacyMappedReplies = mappedReplies.map((reply) => {
        const author = reply.author;
        if (
          author.isPrivate &&
          author.id !== currentUserId &&
          !followingIds.has(author.id)
        ) {
          return {
            ...reply,
            content: '🔒 Bu yanıt gizli bir hesap tarafından yapılmıştır.',
            imageUrl: null,
            videoUrl: null,
            isContentHidden: true,
          };
        }
        return reply;
      });

      return {
        parents,
        post,
        replies: privacyMappedReplies,
      };
    } catch (error) {
      this.myLogger.error(`Thread fetch error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
