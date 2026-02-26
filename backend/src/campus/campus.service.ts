import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CampusService implements OnModuleInit {
  private readonly logger = new Logger(CampusService.name);
  private readonly YEMEKHANE_URL = 'https://mehmetakif.edu.tr/tr/content/10606/haftalik-yemek-listesi';
  
  // Önbellek
  private cachedMenu: any = { thisWeek: [], nextWeek: [] };

  // Sunucu başladığında bir kere çek
  async onModuleInit() {
    this.logger.log('Yemekhane listesi ilk kurulumu yapılıyor...');
    await this.refreshMenu();
  }

  // Her Pazartesi saat 00:00'da otomatik güncelle
  @Cron('0 0 * * 1')
  async handleWeeklyUpdate() {
    this.logger.log('Haftalık yemekhane listesi güncelleniyor...');
    await this.refreshMenu();
  }

  async getCafeteriaMenu() {
    // Eğer önbellek boşsa (hata vb. durumunda) tekrar çekmeyi dene
    if (this.cachedMenu.thisWeek.length === 0) {
      await this.refreshMenu();
    }
    return this.cachedMenu;
  }

  private async refreshMenu() {
    try {
      const { data } = await axios.get(this.YEMEKHANE_URL, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(data);
      const allDays: any[] = [];

      $('.grid.grid-cols-1.md\\:grid-cols-5').find('> div').each((i, dayDiv) => {
        const dayName = $(dayDiv).find('.text-md.text-slate-700.font-semibold').first().text().trim();
        
        if (dayName) {
          const items: string[] = [];
          let calorie = '';

          $(dayDiv).find('.text-md.border-b').each((j, itemDiv) => {
            const text = $(itemDiv).text().trim();
            if (text.toLowerCase().includes('kalori')) {
              calorie = text;
            } else if (text && text !== dayName) {
              items.push(text);
            }
          });

          allDays.push({
            day: dayName,
            items: items,
            calorie: calorie
          });
        }
      });

      if (allDays.length >= 5) {
        this.cachedMenu = {
          thisWeek: allDays.slice(0, 5),
          nextWeek: allDays.slice(5, 10)
        };
        this.logger.log('Yemekhane listesi başarıyla güncellendi.');
      }
    } catch (error) {
      this.logger.error('Yemekhane listesi çekilemedi:', error.message);
    }
  }
}
