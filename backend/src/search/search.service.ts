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
      },
      select: { content: true },
    });

    // Post içeriklerinden hashtagleri çıkar
    const hashtagCounts: Record<string, number> = {};

    posts.forEach(({ content }) => {
      const matches = content.match(/#[\wÇçĞğİıÖöŞşÜü]+/g) || [];
      matches.forEach((tag) => {
        const normalized = tag.toLowerCase();
        hashtagCounts[normalized] = (hashtagCounts[normalized] || 0) + 1;
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
          content: { contains: query, mode: 'insensitive' },
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
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { fullName: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          _count: { select: { followers: true, posts: true } },
        },
        take: 10,
      }),
    ]);

    return { posts, users };
  }

  // Hashtag'e göre postlar
  async searchByHashtag(hashtag: string, currentUserId?: number) {
    const tag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;

    return this.prisma.post.findMany({
      where: {
        published: true,
        content: { contains: tag, mode: 'insensitive' },
      },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatarUrl: true },
        },
        category: true,
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
