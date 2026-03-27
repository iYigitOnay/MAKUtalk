import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname, join, basename } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MediaProcessingService } from '../common/utils/media-processing.service';
import * as fs from 'fs';

@Controller('chat/media')
@UseGuards(JwtAuthGuard)
export class ChatMediaController {
  private readonly logger = new Logger(ChatMediaController.name);

  constructor(private readonly mediaProcessingService: MediaProcessingService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/chat',
        filename: (req, file, cb) => {
          try {
            const uniqueSuffix = uuidv4();
            cb(null, `chat-${uniqueSuffix}${extname(file.originalname)}`);
          } catch (err) {
            cb(err, '');
          }
        },
      }),
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/jpg',
          'video/mp4',
          'video/quicktime',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`Desteklenmeyen dosya tipi: ${file.mimetype}`), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      this.logger.error('Dosya yükleme başarısız: uploadedFile undefined');
      throw new BadRequestException('Dosya bulunamadı.');
    }

    let mediaType = 'FILE';
    let thumbnailUrl: string | null = null;
    let finalUrl = `/uploads/chat/${file.filename}`;

    if (file.mimetype.startsWith('image/')) {
      mediaType = 'IMAGE';
    } else if (file.mimetype.startsWith('video/')) {
      mediaType = 'VIDEO';
      const inputPath = file.path;
      const fileName = file.filename;

      try {
        // 1. Videoyu sıkıştır
        const compressedPath = await this.mediaProcessingService.compressVideo(inputPath, fileName);
        finalUrl = `/uploads/chat/${basename(compressedPath)}`;

        // 2. Thumbnail üret
        const thumbPath = await this.mediaProcessingService.generateThumbnail(compressedPath, fileName);
        thumbnailUrl = `/uploads/covers/${basename(thumbPath)}`;

        // 3. Ham (sıkıştırılmamış) videoyu sil
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      } catch (error) {
        this.logger.error(`Video işleme hatası: ${error.message}`);
        // Hata durumunda ham videoyu URL olarak kullanmaya devam et (thumbnail olmayabilir)
      }
    }

    this.logger.log(`Dosya işlendi: ${basename(finalUrl)} (${mediaType})`);

    return {
      url: finalUrl,
      thumbnailUrl: thumbnailUrl,
      type: mediaType,
      originalName: file.originalname,
      size: file.size,
    };
  }
}

