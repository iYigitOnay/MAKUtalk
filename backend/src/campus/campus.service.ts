import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class CampusService implements OnModuleInit {
  private readonly logger = new Logger(CampusService.name);
  private readonly YEMEKHANE_URL = 'https://mehmetakif.edu.tr/tr/content/10606/haftalik-yemek-listesi';
  
  // Önbellek
  private cachedMenu: any = { thisWeek: [], nextWeek: [] };

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService
  ) {}

  // Sunucu başladığında bir kere çek
  async onModuleInit() {
    this.logger.log('Yemekhane listesi ilk kurulumu yapılıyor...');
    await this.refreshMenu();
  }

  async getAnalytics(interval: 'hour' | 'day' | 'week' = 'day') {
    const now = new Date();
    let startDate: Date;
    let timeLabels: string[] = [];
    let groupFn: (d: Date) => string;

    if (interval === 'hour') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      groupFn = (d) => `${d.getHours()}:00`;
      // Son 24 saat için etiketler
      for(let i=23; i>=0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        timeLabels.push(groupFn(d));
      }
    } else if (interval === 'day') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupFn = (d) => d.toLocaleDateString('tr-TR', { weekday: 'short' });
      for(let i=6; i>=0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        timeLabels.push(groupFn(d));
      }
    } else {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupFn = (d) => `Hafta ${Math.ceil(d.getDate() / 7)}`;
      for(let i=3; i>=0; i--) {
        const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        timeLabels.push(groupFn(d));
      }
    }

    // 1. VERİLERİ ÇEK
    const [posts, likesCount, commentsCount, spotStats, categories, usersCount] = await Promise.all([
      this.prisma.post.findMany({
        where: { createdAt: { gte: startDate }, isDeleted: false },
        select: { createdAt: true, categoryId: true, sentiment: true, sentimentScore: true },
        orderBy: { createdAt: 'asc' }
      }),
      this.prisma.like.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.comment.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.spotListing.aggregate({
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
        _sum: { price: true }
      }),
      this.prisma.category.findMany({
        include: { _count: { select: { posts: { where: { createdAt: { gte: startDate } } } } } }
      }),
      this.prisma.user.count({ where: { createdAt: { gte: startDate } } })
    ]);

    // 2. ZAMAN SERİSİ GRUPLAMA (POSTLAR VE ETKİLEŞİM)
    const timeSeriesData = timeLabels.map(label => ({ label, count: 0, sentimentScore: 0, sentimentCount: 0 }));
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, count: 0 }));
    
    posts.forEach(post => {
      const label = groupFn(post.createdAt);
      const point = timeSeriesData.find(p => p.label === label);
      if (point) {
        point.count++;
        if (post.sentimentScore) {
          point.sentimentScore += post.sentimentScore;
          point.sentimentCount++;
        }
      }

      // Saatlik Yoğunluk (Günün hangi saatinde?)
      const h = post.createdAt.getHours();
      hourlyData[h].count++;
    });

    // Ortalama duygu skorlarını hesapla
    const finalTimeSeries = timeSeriesData.map(p => ({
      label: p.label,
      count: p.count,
      avgSentiment: p.sentimentCount > 0 ? (p.sentimentScore / p.sentimentCount) : 0.5
    }));

    // Ekstra Tablo Verileri (Sadece Gerçek Veri)
    const [topPosts, topUsers, repostsCount] = await Promise.all([
      this.prisma.post.findMany({
        where: { createdAt: { gte: startDate }, isDeleted: false },
        take: 5,
        include: { 
          author: { select: { username: true, fullName: true, avatarUrl: true } }, 
          _count: { select: { likes: true, comments: true, reposts: true } } 
        },
        orderBy: { likes: { _count: 'desc' } }
      }),
      this.prisma.user.findMany({
        take: 5,
        select: { 
          username: true, 
          fullName: true, 
          avatarUrl: true, 
          _count: { select: { posts: true } } 
        },
        orderBy: { posts: { _count: 'desc' } }
      }),
      this.prisma.post.count({ where: { createdAt: { gte: startDate }, NOT: { repostId: null } } })
    ]);

    // 3. DUYGU ANALİZİ DETAYLARI (GERÇEK VERİ)
    const sentimentStats = await this.prisma.post.groupBy({
      by: ['sentiment'],
      where: { createdAt: { gte: startDate }, isDeleted: false, NOT: { sentiment: null } },
      _count: { _all: true }
    });

    const categorySentiment = await this.prisma.post.groupBy({
      by: ['categoryId'],
      where: { createdAt: { gte: startDate }, isDeleted: false, NOT: { sentimentScore: null } },
      _avg: { sentimentScore: true },
      _count: { _all: true }
    });

    // Kategori isimlerini ve renklerini eşleştir
    const categorySentimentRefined = await Promise.all(categorySentiment.map(async (cs) => {
      const cat = categories.find(c => c.id === cs.categoryId);
      return {
        name: cat?.name || 'Genel',
        avgScore: cs._avg.sentimentScore || 0.5,
        count: cs._count._all,
        color: cat?.color || '#3b82f6'
      };
    }));

    // 4. EKONOMİ (SPOT) ANALİZİ DETAYLARI
    const spotCategoryStats = await this.prisma.spotListing.groupBy({
      by: ['category'],
      where: { createdAt: { gte: startDate } },
      _count: { _all: true },
      _sum: { price: true },
      _avg: { price: true }
    });

    // 5. AI ÖZET
    const topCat = categories.sort((a, b) => b._count.posts - a._count.posts)[0];
    const avgSentiment = posts.length > 0 
      ? posts.reduce((acc, p) => acc + (p.sentimentScore || 0.5), 0) / posts.length 
      : 0.5;
    
    const aiSummary = await this.aiService.summarizeCampusLife({
      totalPosts: posts.length,
      topCategory: topCat?.name || 'Henüz Belirlenmedi',
      sentimentSummary: posts.length > 0 ? (avgSentiment > 0.6 ? 'Pozitif' : 'Dengeli') : 'Hareketsiz',
      spotVolume: spotStats._sum.price || 0,
      activeInteractions: likesCount + commentsCount + repostsCount
    });

    return {
      timeRange: { start: startDate, end: now, interval },
      summary: {
        totalPosts: posts.length,
        totalLikes: likesCount,
        totalComments: commentsCount,
        totalReposts: repostsCount,
        spotCount: spotStats._count.id,
        spotTotalValue: spotStats._sum.price || 0,
        newUsers: usersCount,
        avgDailyPosts: Math.round(posts.length / (interval === 'week' ? 30 : interval === 'day' ? 7 : 1)),
        interactionRate: posts.length > 0 ? `%${Math.round(((likesCount + commentsCount + repostsCount) / posts.length) * 100)}` : '%0'
      },
      social: {
        engagementMix: {
          likes: likesCount,
          comments: commentsCount,
          reposts: repostsCount
        },
        hourlyPulse: hourlyData
      },
      sentiment: {
        distribution: sentimentStats.map(s => ({ label: s.sentiment, count: s._count._all })),
        categoryAnalysis: categorySentimentRefined
      },
      economy: {
        categories: spotCategoryStats.map(s => ({
          label: s.category,
          count: s._count._all,
          totalValue: s._sum.price || 0,
          avgPrice: Math.round(s._avg.price || 0)
        }))
      },
      timeSeries: finalTimeSeries,
      categories: categories.map(c => ({ 
        name: c.name, 
        count: c._count.posts, 
        color: c.color,
        percentage: posts.length > 0 ? Math.round((c._count.posts / posts.length) * 100) : 0
      })).filter(c => c.count > 0),
      topPosts,
      topUsers,
      aiSummary
    };
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
