// src/search/search.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  // Popüler hashtagleri çek (son 7 günün postlarından)
  async getPopularHashtags(limit = 10) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const posts = await this.prisma.post.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        published: true,
        author: {
          isPrivate: false,
          isBanned: false,
        },
      },
      select: { content: true },
    });

    // Post içeriklerinden hashtagleri çıkar
    const hashtagCounts: Record<string, number> = {};

    posts.forEach(({ content }) => {
      if (!content) return;
      // Güvenli hashtag regex'i
      const matches = content.match(/#[a-zA-Z0-9çğıöşüÇĞİÖŞÜ]+/g) || [];
      matches.forEach((tag) => {
        // Başındaki # işaretini at ve küçük harfe çevir
        const normalized = tag.slice(1).toLowerCase();
        if (normalized.length >= 2) {
          hashtagCounts[normalized] = (hashtagCounts[normalized] || 0) + 1;
        }
      });
    });

    // Sırala ve limit uygula
    return Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  // Genel arama
  async search(query: string, currentUserId?: number) {
    if (!query || query.trim().length < 2) return { posts: [], users: [] };

    const [posts, users] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          published: true,
          isDeleted: false,
          content: { contains: query, mode: 'insensitive' },
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
  async searchByHashtag(hashtag: string, currentUserId?: number) {
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
