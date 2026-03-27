import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

@Injectable()
export class MediaProcessingService {
  private readonly logger = new Logger(MediaProcessingService.name);

  constructor() {
    if (ffmpegStatic) {
      this.logger.log(`FFmpeg yolu ayarlanÄ±yor: ${ffmpegStatic}`);
      ffmpeg.setFfmpegPath(ffmpegStatic);
    } else {
      this.logger.error('FFmpeg yolu bulunamadÄ±!');
    }
  }

  async compressVideo(
    inputPath: string,
    outputFileName: string,
  ): Promise<string> {
    const outputDir = path.join(process.cwd(), 'uploads', 'chat');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `compressed-${outputFileName}`);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .size('?x720')
        .videoCodec('libx264')
        .videoBitrate('2500k')
        .addOption('-crf', '24')
        .addOption('-preset', 'slow')
        .audioCodec('aac')
        .audioBitrate('128k')
        .on('start', (commandLine: string) => {
          this.logger.log('FFmpeg SÄ±kÄ±ÅŸtÄ±rma BaÅŸladÄ±: ' + commandLine);
        })
        .on('end', () => {
          this.logger.log('FFmpeg SÄ±kÄ±ÅŸtÄ±rma TamamlandÄ±: ' + outputPath);
          resolve(outputPath);
        })
        .on('error', (err: any) => {
          this.logger.error('FFmpeg HatasÄ±: ' + err.message);
          reject(err);
        })
        .save(outputPath);
    });
  }

  async generateThumbnail(
    videoPath: string,
    outputFileName: string,
  ): Promise<string> {
    const outputDir = path.join(process.cwd(), 'uploads', 'covers');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const thumbnailName = `thumb-${outputFileName.replace(path.extname(outputFileName), '.jpg')}`;

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['00:00:01'],
          filename: thumbnailName,
          folder: outputDir,
        })
        .on('end', () => {
          const outputPath = path.join(outputDir, thumbnailName);
          this.logger.log('Thumbnail OluÅŸturuldu: ' + outputPath);
          resolve(outputPath);
        })
        .on('error', (err: any) => {
          this.logger.error('Thumbnail HatasÄ±: ' + err.message);
          reject(err);
        });
    });
  }
}
