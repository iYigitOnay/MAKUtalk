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
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('chat/media')
@UseGuards(JwtAuthGuard)
export class ChatMediaController {
  private readonly logger = new Logger(ChatMediaController.name);

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
        fileSize: 20 * 1024 * 1024, // 20MB
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
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      this.logger.error('Dosya yükleme başarısız: uploadedFile undefined');
      throw new BadRequestException('Dosya bulunamadı.');
    }

    let mediaType = 'FILE';
    if (file.mimetype.startsWith('image/')) {
      mediaType = 'IMAGE';
    } else if (file.mimetype.startsWith('video/')) {
      mediaType = 'VIDEO';
    }

    this.logger.log(`Dosya yüklendi: ${file.filename} (${mediaType})`);

    return {
      url: `/uploads/chat/${file.filename}`,
      type: mediaType,
      originalName: file.originalname,
      size: file.size,
    };
  }
}
