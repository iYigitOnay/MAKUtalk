import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private prisma: PrismaService) {}

  // Her gece saat 03:00'te çalışır
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handlePostCleanup() {
    this.logger.log('Silinmiş postların temizlik işlemi başlatılıyor...');

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    try {
      const deleteResult = await this.prisma.post.deleteMany({
        where: {
          isDeleted: true,
          deletedAt: {
            lt: fifteenDaysAgo,
          },
        },
      });

      if (deleteResult.count > 0) {
        this.logger.log(
          `${deleteResult.count} adet eski post kalıcı olarak silindi.`,
        );
      } else {
        this.logger.log('Temizlenecek eski post bulunamadı.');
      }
    } catch (error) {
      this.logger.error(`Post temizleme hatası: ${error.message}`, error.stack);
    }
  }

  // Hashtag temizliği (Opsiyonel: Kullanım sayısı 0 olan ve 1 aydır güncellenmeyen hashtagleri siler)
  @Cron(CronExpression.EVERY_WEEKEND)
  async handleHashtagCleanup() {
    this.logger.log('Kullanılmayan hashtag temizliği başlatılıyor...');

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    try {
      const deleteResult = await this.prisma.hashtag.deleteMany({
        where: {
          usageCount: { lte: 0 },
          updatedAt: { lt: oneMonthAgo },
        },
      });

      if (deleteResult.count > 0) {
        this.logger.log(
          `${deleteResult.count} adet kullanılmayan hashtag silindi.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Hashtag temizleme hatası: ${error.message}`,
        error.stack,
      );
    }
  }
}
