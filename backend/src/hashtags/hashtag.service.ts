import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SnowflakeService } from '../common/snowflake/snowflake.service';

@Injectable()
export class HashtagService {
  private readonly logger = new Logger(HashtagService.name);

  constructor(
    private prisma: PrismaService,
    private snowflakeService: SnowflakeService,
  ) {}

  // Post içeriğinden hashtag'leri çıkar
  extractHashtags(content: string | null): string[] {
    if (!content) return [];
    const hashtagRegex = /#[a-zA-Z0-9çğıöşüÇĞİÖŞÜ]+/g;
    const matches = content.match(hashtagRegex);
    if (!matches) return [];

    // Tekrar edenleri temizle ve küçük harfe çevir (başındaki #'i at)
    return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
  }

  // Post oluşturulduğunda veya güncellendiğinde hashtag'leri senkronize et
  async syncHashtags(postId: bigint, content: string | null) {
    const newTags = this.extractHashtags(content);

    const currentPost = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { hashtags: true },
    });

    if (!currentPost) return;

    const oldTags = currentPost.hashtags.map((h) => h.name);
    const removedTags = oldTags.filter((tag) => !newTags.includes(tag));
    const addedTags = newTags.filter((tag) => !oldTags.includes(tag));

    for (const tagName of removedTags) {
      const tag = currentPost.hashtags.find((h) => h.name === tagName);
      if (tag) {
        await this.prisma.hashtag.update({
          where: { id: tag.id },
          data: {
            usageCount: { decrement: 1 },
            posts: { disconnect: { id: postId } },
          },
        });
        this.logger.log(`Hashtag düşürüldü (Sync): #${tagName}, Post: ${postId}`);
      }
    }

    for (const tagName of addedTags) {
      await this.prisma.hashtag.upsert({
        where: { name: tagName },
        update: {
          usageCount: { increment: 1 },
          posts: { connect: { id: postId } },
        },
        create: {
          id: this.snowflakeService.getNextId(),
          name: tagName,
          usageCount: 1,
          posts: { connect: { id: postId } },
        },
      });
      this.logger.log(`Hashtag artırıldı (Sync): #${tagName}, Post: ${postId}`);
    }
  }

  // Post silindiğinde sayaçları düşür - EN GARANTİ YÖNTEM
  async decrementHashtagCounts(postId: bigint) {
    // Postu ve içeriğini çek (isDeleted: true olsa bile findUnique getirir)
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { content: true }
    });

    if (!post || !post.content) return;

    const tags = this.extractHashtags(post.content);
    this.logger.log(`Post siliniyor, hashtagler düşürülüyor: ${tags.join(', ')}`);

    for (const tagName of tags) {
      const tag = await this.prisma.hashtag.findUnique({
        where: { name: tagName }
      });

      if (tag && tag.usageCount > 0) {
        await this.prisma.hashtag.update({
          where: { id: tag.id },
          data: {
            usageCount: { decrement: 1 },
            posts: { disconnect: { id: postId } }
          }
        });
        this.logger.log(`Hashtag sayacı düşürüldü: #${tagName}, Yeni Sayaç: ${tag.usageCount - 1}`);
      }
    }
  }

  async getPostsByHashtag(hashtag: string, userId?: bigint) {
    const posts = await this.prisma.post.findMany({
      where: {
        hashtags: {
          some: {
            name: hashtag.toLowerCase(),
          },
        },
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
    return this.prisma.hashtag.findMany({
      where: {
        usageCount: { gt: 0 }, // Sadece 0'dan büyük olanlar
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
  }
}
