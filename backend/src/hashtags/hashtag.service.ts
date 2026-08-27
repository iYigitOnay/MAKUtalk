import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SnowflakeService } from '../common/snowflake/snowflake.service';

@Injectable()
export class HashtagService {
  private readonly logger = new Logger('HashtagService');

  constructor(
    private prisma: PrismaService,
    private snowflakeService: SnowflakeService,
  ) {}

  extractHashtags(content: string | null): string[] {
    if (!content) return [];
    const hashtagRegex = /#[a-zA-Z0-9çğıöşüÇĞİÖŞÜ]+/g;
    const matches = content.match(hashtagRegex);
    if (!matches) return [];
    return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
  }

  async syncHashtags(postId: bigint, content: string | null) {
    this.logger.log(`[SYNC] Başladı - PostID: ${postId}`);
    const newTags = this.extractHashtags(content);

    const currentPost = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { 
        hashtags: true,
        author: { select: { isPrivate: true } }
      },
    });

    if (!currentPost) {
      this.logger.warn(`[SYNC] Post bulunamadı: ${postId}`);
      return;
    }

    if (currentPost.author.isPrivate) {
      this.logger.log(`[SYNC] Gizli hesap tespiti. Sayaç artırılmıyor. Post: ${postId}`);
      if (currentPost.hashtags.length > 0) {
        this.logger.log(`[SYNC] Gizli hesaba ait eski tagler temizleniyor...`);
        await this.clearPostHashtags(postId, currentPost.hashtags);
      }
      return;
    }

    const oldTags = currentPost.hashtags.map((h) => h.name);
    const removedTags = oldTags.filter((tag) => !newTags.includes(tag));
    const addedTags = newTags.filter((tag) => !oldTags.includes(tag));

    this.logger.log(`[SYNC] Mevcut Tagler: ${oldTags.join(',')} | Yeni Tagler: ${newTags.join(',')} | Eklenecek: ${addedTags.join(',')} | Silinecek: ${removedTags.join(',')}`);

    for (const tagName of removedTags) {
      const tag = currentPost.hashtags.find((h) => h.name === tagName);
      if (tag) {
        const updated = await this.prisma.hashtag.update({
          where: { id: tag.id },
          data: {
            usageCount: { decrement: 1 },
            posts: { disconnect: { id: postId } },
          },
        });
        this.logger.log(`[SYNC] Tag düşürüldü: #${tagName}, Yeni Sayaç: ${updated.usageCount}`);
      }
    }

    for (const tagName of addedTags) {
      const updated = await this.prisma.hashtag.upsert({
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
      this.logger.log(`[SYNC] Tag artırıldı: #${tagName}, Yeni Sayaç: ${updated.usageCount}`);
    }
  }

  async decrementHashtagCounts(postId: bigint, force = false) {
    this.logger.log(`[DECREMENT] Başladı - PostID: ${postId}, Force: ${force}`);
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { 
        hashtags: { select: { id: true, name: true, usageCount: true } },
        author: { select: { isPrivate: true } }
      }
    });

    if (!post) {
      this.logger.warn(`[DECREMENT] Post bulunamadı: ${postId}`);
      return;
    }

    if (!force && post.author.isPrivate) {
      this.logger.log(`[DECREMENT] Gizli hesap, zaten sayılmamıştı. İşlem atlanıyor. Post: ${postId}`);
      return;
    }

    this.logger.log(`[DECREMENT] Silinecek Tagler: ${post.hashtags.map(h => h.name).join(',')}`);

    for (const hashtag of post.hashtags) {
      const updated = await this.prisma.hashtag.update({
        where: { id: hashtag.id },
        data: {
          usageCount: { decrement: 1 },
          posts: { disconnect: { id: postId } }
        }
      });
      this.logger.log(`[DECREMENT] Tag düşürüldü: #${hashtag.name}, Yeni Sayaç: ${updated.usageCount}`);
    }
  }

  private async clearPostHashtags(postId: bigint, hashtags: any[]) {
    for (const hashtag of hashtags) {
      await this.prisma.hashtag.update({
        where: { id: hashtag.id },
        data: {
          usageCount: { decrement: 1 },
          posts: { disconnect: { id: postId } }
        }
      });
    }
  }

  async syncUserHashtagsAfterPrivacyChange(userId: bigint, isNowPrivate: boolean) {
    this.logger.log(`[PRIVACY-SYNC] Başladı - User: ${userId}, Yeni Durum: ${isNowPrivate ? 'GİZLİ' : 'AÇIK'}`);

    const userPosts = await this.prisma.post.findMany({
      where: { authorId: userId, isDeleted: false, content: { not: null } },
      select: { id: true, content: true }
    });

    this.logger.log(`[PRIVACY-SYNC] Kullanıcının taranacak post sayısı: ${userPosts.length}`);

    if (isNowPrivate) {
      for (const post of userPosts) {
        await this.decrementHashtagCounts(post.id, true);
      }
    } else {
      for (const post of userPosts) {
        const tags = this.extractHashtags(post.content);
        for (const tagName of tags) {
          const updated = await this.prisma.hashtag.upsert({
            where: { name: tagName },
            update: {
              usageCount: { increment: 1 },
              posts: { connect: { id: post.id } }
            },
            create: {
              id: this.snowflakeService.getNextId(),
              name: tagName,
              usageCount: 1,
              posts: { connect: { id: post.id } }
            }
          });
          this.logger.log(`[PRIVACY-SYNC] Tag artırıldı: #${tagName}, Post: ${post.id}, Sayaç: ${updated.usageCount}`);
        }
      }
    }
    this.logger.log(`[PRIVACY-SYNC] Tamamlandı - User: ${userId}`);
  }

  async getTrendingHashtags(limit = 10) {
    const trends = await this.prisma.hashtag.findMany({
      where: { usageCount: { gt: 0 } },
      select: { name: true, usageCount: true },
      orderBy: { usageCount: 'desc' },
      take: limit,
    });
    this.logger.log(`[TRENDING] İstek geldi. Dönen Tag Sayısı: ${trends.length}`);
    return trends;
  }

  async getPostsByHashtag(hashtag: string, userId?: bigint) {
    return this.prisma.post.findMany({
      where: {
        hashtags: { some: { name: hashtag.toLowerCase() } },
        published: true,
        isDeleted: false,
        author: { isPrivate: false }
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true } },
        category: true,
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
