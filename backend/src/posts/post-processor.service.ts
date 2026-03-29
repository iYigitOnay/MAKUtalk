import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { MediaProcessingService } from '../common/utils/media-processing.service';
import { MyLogger } from '../common/logger/logger.service';
import { ChatGateway } from '../chat/chat.gateway';
import { HashtagService } from '../hashtags/hashtag.service';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PostProcessorService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private mediaProcessingService: MediaProcessingService,
    private myLogger: MyLogger,
    private chatGateway: ChatGateway,
    private hashtagService: HashtagService,
  ) {}

  @OnEvent('post.created')
  async handlePostCreated(payload: {
    postId: bigint;
    userId: bigint;
    content: string;
    files?: any;
    isReply: boolean;
    categoryId?: string;
    shouldIdentifyCategory: boolean;
  }) {
    const {
      postId,
      userId,
      content,
      files,
      isReply,
      categoryId,
      shouldIdentifyCategory,
    } = payload;

    try {
      this.myLogger.log(`Post işleme başladı: ${postId}`, 'PostProcessor');

      // 0. BaÅŸlangÄ±Ã§ Duyurusu
      this.chatGateway.broadcastPostUpdate({
        id: postId.toString(),
        processingStatus: 'PREPARING',
        isProcessing: true,
      });

      // 1. Medya Ä°ÅŸleme
      let imageUrl: string | null = null;
      let videoUrl: string | null = null;
      let thumbnailUrl: string | null = null;

      if (files?.image?.[0] || files?.video?.[0]) {
        this.chatGateway.broadcastPostUpdate({
          id: postId.toString(),
          processingStatus: 'MEDIA',
          isProcessing: true,
        });
      }

      if (files?.image?.[0]) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'posts');
        const fileName = `post-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
        const filePath = path.join(uploadDir, fileName);

        await sharp(files.image[0].buffer)
          .resize(1200, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(filePath);
        imageUrl = `/uploads/posts/${fileName}`;
      }

      if (files?.video?.[0]) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'posts');
        const fileName = `post-video-${Date.now()}-${files.video[0].originalname.replace(/\s+/g, '_')}`;
        const tempPath = path.join(uploadDir, `temp-${fileName}`);

        fs.writeFileSync(tempPath, files.video[0].buffer);

        const compressedPath = await this.mediaProcessingService.compressVideo(
          tempPath,
          fileName,
        );
        videoUrl = `/uploads/chat/${path.basename(compressedPath)}`;

        const thumbPath = await this.mediaProcessingService.generateThumbnail(
          compressedPath,
          fileName,
        );
        thumbnailUrl = `/uploads/covers/${path.basename(thumbPath)}`;

        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }

      // 2. AI Analizi
      this.chatGateway.broadcastPostUpdate({
        id: postId.toString(),
        processingStatus: 'AI',
        isProcessing: true,
      });
      const aiAnalysis = await this.aiService.analyzePost(
        content,
        shouldIdentifyCategory,
      );

      let finalCategoryId = categoryId ? BigInt(categoryId) : undefined;
      if (
        shouldIdentifyCategory &&
        !finalCategoryId &&
        aiAnalysis.suggestedCategorySlug
      ) {
        const suggestedCategory = await this.prisma.category.findUnique({
          where: {
            slug: aiAnalysis.suggestedCategorySlug.toLowerCase().trim(),
          },
        });
        finalCategoryId = suggestedCategory?.id;
      }

      // 3. VeritabanÄ± GÃ¼ncelleme (FINAL)
      this.chatGateway.broadcastPostUpdate({
        id: postId.toString(),
        processingStatus: 'FINALIZING',
        isProcessing: true,
      });

      const updatedPost = await this.prisma.post.update({
        where: { id: postId },
        data: {
          imageUrl,
          videoUrl,
          thumbnailUrl,
          categoryId: finalCategoryId,
          sentiment: aiAnalysis.sentiment,
          sentimentScore: aiAnalysis.sentimentScore,
          isProcessing: false,
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

      this.chatGateway.broadcastPostUpdate(updatedPost);

      this.myLogger.log(`Post işleme tamamlandı: ${postId}`, 'PostProcessor');
    } catch (error) {
      this.myLogger.error(
        `Post işleme hatasÄ± (${postId}): ${error.message}`,
        error.stack,
        'PostProcessor',
      );
      await this.prisma.post.update({
        where: { id: postId },
        data: { isProcessing: false },
      });
    }
  }
}
