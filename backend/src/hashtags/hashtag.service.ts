import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HashtagService {
  constructor(private prisma: PrismaService) {}

  // Post içeriğinden hashtag'leri çıkar
  extractHashtags(content: string | null): string[] {
    if (!content) return [];
    const hashtagRegex = /#[a-zA-Z0-9çğıöşüÇĞİÖŞÜ]+/g;
    const matches = content.match(hashtagRegex);
    if (!matches) return [];

    return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
  }

  // Hashtag'e göre postları getir
  async getPostsByHashtag(hashtag: string, userId?: number) {
    const posts = await this.prisma.post.findMany({
      where: {
        content: {
          contains: `#${hashtag.toLowerCase()}`,
          mode: 'insensitive',
        },
        published: true,
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
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (userId && posts.length > 0) {
      const postIds = posts.map((p) => p.id);
      const userLikes = await this.prisma.like.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
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

  async getTrendingHashtags(limit = 10) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const posts = await this.prisma.post.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        published: true,
      },
      select: { content: true },
    });

    const hashtagCount = new Map<string, number>();
    posts.forEach((post) => {
      const hashtags = this.extractHashtags(post.content);
      hashtags.forEach((tag) => {
        hashtagCount.set(tag, (hashtagCount.get(tag) || 0) + 1);
      });
    });

    const trending = Array.from(hashtagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));

    return trending;
  }
}
