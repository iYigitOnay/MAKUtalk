// src/search/search.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  // Popüler hashtagleri çek (Yeni tablo yapısını kullanarak)
  async getPopularHashtags(limit = 10) {
    const hashtags = await this.prisma.hashtag.findMany({
      where: {
        usageCount: { gt: 0 },
      },
      select: {
        name: true,
        usageCount: true,
      },
      orderBy: {
        usageCount: 'desc',
      },
      take: limit,
    });

    return hashtags.map((h) => ({ tag: h.name, count: h.usageCount }));
  }

  // Genel arama
  async search(query: string, currentUserId?: bigint) {
    if (!query || query.trim().length < 2) return { posts: [], users: [] };

    // Engel filtresi
    let blockedIds: bigint[] = [];
    if (currentUserId) {
      const [blocking, blockedBy] = await Promise.all([
        this.prisma.block.findMany({ where: { blockerId: currentUserId }, select: { blockedId: true } }),
        this.prisma.block.findMany({ where: { blockedId: currentUserId }, select: { blockerId: true } }),
      ]);
      blockedIds = [...blocking.map(b => b.blockedId), ...blockedBy.map(b => b.blockerId)];
    }

    const [posts, users] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          published: true,
          isDeleted: false,
          content: { contains: query, mode: 'insensitive' },
          authorId: { notIn: blockedIds },
          author: {
            OR: [
              { isPrivate: false }, // Herkese açık hesaplar
              ...(currentUserId ? [{ id: currentUserId }] : []), // Kendi postlarım
            ],
          },
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              badges: { include: { badge: true } }
            },
          },
          category: true,
          repostOf: {
            include: {
              author: { select: { id: true, username: true, fullName: true, avatarUrl: true, badges: { include: { badge: true } } } },
              category: true,
              _count: { select: { likes: true, replies: true, reposts: true } }
            }
          },
          _count: { 
            select: { 
              likes: true, 
              replies: { where: { isDeleted: false } }, 
              reposts: { where: { isDeleted: false } } 
            } 
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 30, // Sonuç sayısını biraz artırdık
      }),
      this.prisma.user.findMany({
        where: {
          id: { notIn: blockedIds },
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { fullName: { contains: query, mode: 'insensitive' } },
          ],
          isBanned: false,
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          isPrivate: true,
          badges: { include: { badge: true } },
          _count: { select: { followers: true, posts: true } },
        },
        take: 10,
      }),
    ]);

    // Etkileşim durumlarını ekle (LIKE & REPOST)
    if (currentUserId && posts.length > 0) {
      const [userLikes, userReposts] = await Promise.all([
        this.prisma.like.findMany({
          where: { userId: currentUserId, postId: { in: posts.map(p => p.repostId || p.id) } },
          select: { postId: true }
        }),
        this.prisma.post.findMany({
          where: { authorId: currentUserId, repostId: { in: posts.map(p => p.repostId || p.id) }, isDeleted: false },
          select: { repostId: true }
        })
      ]);

      const likedIds = new Set(userLikes.map(l => l.postId));
      const repostedIds = new Set(userReposts.map(r => r.repostId));

      posts.forEach((p: any) => {
        const targetId = p.repostId || p.id;
        p.isLiked = likedIds.has(targetId);
        p.isReposted = repostedIds.has(targetId);
        if (p.repostOf) {
          p.repostOf.isLiked = p.isLiked;
          p.repostOf.isReposted = p.isReposted;
        }
      });
    }

    return { posts, users };
  }

  // Hashtag'e göre postlar
  async searchByHashtag(hashtag: string, currentUserId?: bigint) {
    const tag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;

    const posts = await this.prisma.post.findMany({
      where: {
        published: true,
        isDeleted: false,
        content: { contains: tag, mode: 'insensitive' },
        author: {
          OR: [
            { isPrivate: false }, // Herkese açık hesaplar
            ...(currentUserId ? [{ id: currentUserId }] : []), // Kendi postlarım
          ],
        },
      },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } },
        },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, replies: true, reposts: true } }
          }
        },
        _count: { select: { likes: true, replies: true, reposts: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Etkileşim durumlarını ekle (LIKE & REPOST)
    if (currentUserId && posts.length > 0) {
      const [userLikes, userReposts] = await Promise.all([
        this.prisma.like.findMany({
          where: { userId: currentUserId, postId: { in: posts.map(p => p.repostId || p.id) } },
          select: { postId: true }
        }),
        this.prisma.post.findMany({
          where: { authorId: currentUserId, repostId: { in: posts.map(p => p.repostId || p.id) }, isDeleted: false },
          select: { repostId: true }
        })
      ]);

      const likedIds = new Set(userLikes.map(l => l.postId));
      const repostedIds = new Set(userReposts.map(r => r.repostId));

      posts.forEach((p: any) => {
        const targetId = p.repostId || p.id;
        p.isLiked = likedIds.has(targetId);
        p.isReposted = repostedIds.has(targetId);
        if (p.repostOf) {
          p.repostOf.isLiked = p.isLiked;
          p.repostOf.isReposted = p.isReposted;
        }
      });
    }

    return posts;
  }
}
