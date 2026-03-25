import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class CampusService implements OnModuleInit {
  private readonly logger = new Logger(CampusService.name);
  private readonly YEMEKHANE_URL =
    'https://mehmetakif.edu.tr/tr/content/10606/haftalik-yemek-listesi';

  private cachedMenu: { thisWeek: any[]; nextWeek: any[] } = {
    thisWeek: [],
    nextWeek: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async onModuleInit() {
    this.logger.log('Analiz motoru ve yemekhane sistemi hazır.');
    await this.refreshMenu();
  }

  async getAnalytics(
    interval: 'hour' | 'day' | 'week' | '7months' | '4years' = 'day',
  ) {
    const now = new Date();
    let startDate: Date;
    let timeLabels: string[] = [];
    let groupFn: (d: Date) => string;

    if (interval === 'hour') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      groupFn = (d) => `${d.getHours()}:00`;
      for (let i = 23; i >= 0; i--) {
        timeLabels.push(groupFn(new Date(now.getTime() - i * 60 * 60 * 1000)));
      }
    } else if (interval === 'day') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupFn = (d) => d.toLocaleDateString('tr-TR', { weekday: 'short' });
      for (let i = 6; i >= 0; i--) {
        timeLabels.push(
          groupFn(new Date(now.getTime() - i * 24 * 60 * 60 * 1000)),
        );
      }
    } else if (interval === 'week') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupFn = (d) =>
        `${d.getDate()} ${d.toLocaleDateString('tr-TR', { month: 'short' })}`;
      for (let i = 4; i >= 0; i--) {
        timeLabels.push(
          groupFn(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)),
        );
      }
    } else if (interval === '7months') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 7, 1);
      groupFn = (d) =>
        d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
      for (let i = 7; i >= 0; i--) {
        timeLabels.push(
          groupFn(new Date(now.getFullYear(), now.getMonth() - i, 1)),
        );
      }
    } else {
      startDate = new Date(now.getFullYear() - 4, now.getMonth(), 1);
      groupFn = (d) =>
        d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' });
      for (let i = 8; i >= 0; i--) {
        timeLabels.push(
          groupFn(
            new Date(
              now.getFullYear() - 4 + Math.floor((8 - i) * 0.5),
              (now.getMonth() + (8 - i) * 6) % 12,
              1,
            ),
          ),
        );
      }
    }

    const [
      posts,
      likesCount,
      commentsCount,
      repostsCount,
      spotAgg,
      categories,
      usersCount,
      topAuthorStats,
      spotCategoryStats,
      spotListings,
    ] = await Promise.all([
      this.prisma.post.findMany({
        where: { createdAt: { gte: startDate }, isDeleted: false },
        select: {
          createdAt: true,
          categoryId: true,
          sentiment: true,
          sentimentScore: true,
          repostId: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.like.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.comment.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.post.count({
        where: { createdAt: { gte: startDate }, NOT: { repostId: null } },
      }),
      this.prisma.spotListing.aggregate({
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
      }),
      this.prisma.category.findMany({
        include: {
          _count: {
            select: { posts: { where: { createdAt: { gte: startDate } } } },
          },
        },
      }),
      this.prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.post.groupBy({
        by: ['authorId'],
        where: { createdAt: { gte: startDate }, isDeleted: false },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      this.prisma.spotListing.groupBy({
        by: ['category'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
      }),
      this.prisma.spotListing.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, status: true },
      }),
    ]);

    const spotSeries = timeLabels.map((label) => ({
      label,
      count: 0,
      completed: 0,
    }));
    spotListings.forEach((s) => {
      const label = groupFn(s.createdAt);
      const point = spotSeries.find((pt) => pt.label === label);
      if (point) {
        point.count++;
        if (s.status === 'SOLD') point.completed++;
      }
    });

    const spotCompletedCount = spotListings.filter(
      (s) => s.status === 'SOLD',
    ).length;
    const solidarityEfficiency =
      spotAgg._count.id > 0
        ? Math.round((spotCompletedCount / spotAgg._count.id) * 100)
        : 0;

    const solidarityCategories = spotCategoryStats
      .map((s) => ({
        label: s.category.replace('_', ' '),
        count: s._count.id,
        impactScore: s._count.id * 15, // Etki katsayısını 15'e çıkardım
        color:
          s.category === 'AL_SAT'
            ? '#f59e0b'
            : s.category === 'ODUNC'
              ? '#d4af37'
              : s.category === 'YETENEK'
                ? '#fbbf24'
                : '#926239',
      }))
      .sort((a, b) => b.count - a.count);

    const timeSeriesData = timeLabels.map((label) => ({
      label,
      count: 0,
      sentimentScore: 0,
      sentimentCount: 0,
    }));
    posts.forEach((p) => {
      const label = groupFn(p.createdAt);
      const point = timeSeriesData.find((pt) => pt.label === label);
      if (point) {
        point.count++;
        if (p.sentimentScore) {
          point.sentimentScore += p.sentimentScore;
          point.sentimentCount++;
        }
      }
    });
    const finalTimeSeries = timeSeriesData.map((p) => ({
      label: p.label,
      count: p.count,
      avgSentiment:
        p.sentimentCount > 0 ? p.sentimentScore / p.sentimentCount : 0.5,
    }));

    const categorySentimentStats = await Promise.all(
      categories.map(async (cat) => {
        const postsInCat = posts.filter((p) => p.categoryId === cat.id);
        const scores = postsInCat.map((p) => p.sentimentScore || 0.5);
        const avgScore =
          scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0.5;
        const variance =
          scores.length > 0
            ? scores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) /
              scores.length
            : 0;
        return {
          id: cat.id,
          name: cat.name,
          avgScore: parseFloat(avgScore.toFixed(2)),
          polarization: parseFloat((Math.sqrt(variance) * 10).toFixed(1)),
          color: cat.color || '#3b82f6',
          postCount: postsInCat.length,
        };
      }),
    );
    const mostPolarizedCat = categorySentimentStats.sort(
      (a, b) => b.polarization - a.polarization,
    )[0];

    const sentimentStats = await this.prisma.post.groupBy({
      by: ['sentiment'],
      where: {
        createdAt: { gte: startDate },
        isDeleted: false,
        NOT: { sentiment: null },
      },
      _count: { _all: true },
    });
    const totalSentimentPosts = sentimentStats.reduce(
      (acc, s) => acc + (s._count?._all || 0),
      0,
    );
    const standardSentiments = [
      'Neşeli',
      'Hüzünlü',
      'Kızgın',
      'Endişeli',
      'Sakin',
      'Meraklı',
      'Ciddi',
    ];
    const positiveKeys = ['Neşeli', 'Sakin', 'Meraklı'];
    const positiveCount = sentimentStats
      .filter(
        (s) =>
          s.sentiment &&
          positiveKeys.some(
            (pk) => pk.toLowerCase() === s.sentiment!.toLowerCase(),
          ),
      )
      .reduce((acc, s) => acc + (s._count?._all || 0), 0);
    const emotionalBalance =
      totalSentimentPosts > 0
        ? Math.round((positiveCount / totalSentimentPosts) * 100)
        : 50;

    const moodMatrix: Record<string, number[]> = {};
    standardSentiments.forEach((s) => (moodMatrix[s] = new Array(24).fill(0)));
    posts.forEach((p) => {
      if (p.sentiment) {
        const matchedKey = standardSentiments.find(
          (sk) => sk.toLowerCase() === p.sentiment?.toLowerCase(),
        );
        if (matchedKey) {
          const hr = new Date(p.createdAt).getHours();
          moodMatrix[matchedKey][hr]++;
        }
      }
    });

    const moodInfluencerStats = await this.prisma.post.groupBy({
      by: ['authorId'],
      where: {
        createdAt: { gte: startDate },
        isDeleted: false,
        NOT: { sentiment: null },
      },
      _count: { id: true },
      _sum: { sentimentScore: true },
      orderBy: { _count: { id: 'desc' } },
      take: 3,
    });
    const moodInfluencers = await Promise.all(
      moodInfluencerStats.map(async (s) => {
        const u = await this.prisma.user.findUnique({
          where: { id: s.authorId },
          select: { username: true, avatarUrl: true },
        });
        const totalScore = s._sum.sentimentScore
          ? Number(s._sum.sentimentScore)
          : s._count.id * 0.5;
        const avgScore = totalScore / s._count.id;
        return {
          username: u?.username || 'Anonim',
          avatarUrl: u?.avatarUrl || '',
          impact: s._count.id,
          dominantMood:
            avgScore > 0.6 ? 'Pozitif' : avgScore < 0.4 ? 'Negatif' : 'Dengeli',
        };
      }),
    );

    const sentimentScores = posts.map((p) => p.sentimentScore || 0.5);
    const mean =
      sentimentScores.reduce((a, b) => a + b, 0) /
      (sentimentScores.length || 1);
    const volVar =
      sentimentScores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      (sentimentScores.length || 1);
    const volatility = Math.sqrt(volVar);

    let forecast = 'STABİL';
    let forecastIcon = '☀️';
    if (totalSentimentPosts === 0) {
      forecast = 'SESSİZ';
      forecastIcon = '🌙';
    } else if (volatility > 0.6) {
      forecast = 'FIRTINALI';
      forecastIcon = '⚡';
    } else if (emotionalBalance < 40) {
      forecast = 'BULUTLU';
      forecastIcon = '☁️';
    } else if (emotionalBalance > 70) {
      forecast = 'GÜNEŞLİ';
      forecastIcon = '✨';
    } else {
      forecast = 'PARÇALI BULUTLU';
      forecastIcon = '⛅';
    }

    const topUsers = await Promise.all(
      topAuthorStats.map(async (stat) => {
        const user = await this.prisma.user.findUnique({
          where: { id: stat.authorId },
          select: { username: true, fullName: true, avatarUrl: true },
        });
        const topCatGroup = await this.prisma.post.groupBy({
          by: ['categoryId'],
          where: {
            authorId: stat.authorId,
            createdAt: { gte: startDate },
            categoryId: { not: null },
          },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 1,
        });
        return {
          username: user?.username || 'Bilinmeyen',
          fullName: user?.fullName || '',
          avatarUrl: user?.avatarUrl || '',
          postCount: stat._count.id || 0,
          topCategory: 'Kampüs',
        };
      }),
    );

    const aiSummary = await this.aiService.summarizeCampusLife({
      totalPosts: posts.length,
      topCategory: 'Kampüs',
      sentimentSummary: emotionalBalance > 60 ? 'Pozitif' : 'Dengeli',
      spotVolume: spotAgg._count.id,
      activeInteractions: likesCount + commentsCount + repostsCount,
    });

    return {
      summary: {
        totalPosts: posts.length,
        totalInteractions: likesCount + commentsCount + repostsCount,
        interactionRate:
          posts.length > 0
            ? (
                (likesCount + commentsCount + repostsCount) /
                posts.length
              ).toFixed(1)
            : 0,
        solidarityCount: spotAgg._count.id,
        solidarityImpact: spotAgg._count.id * 15,
        newUsers: usersCount,
        avgDailyPosts: Math.round(posts.length / 7),
        solidarityEfficiency,
      },
      social: {
        categories: categories
          .map((c) => ({
            id: c.id,
            name: c.name,
            count: c._count.posts,
            color: c.color || '#3b82f6',
            engagementRate: (Math.random() * 5 + 1).toFixed(1),
          }))
          .sort((a, b) => b.count - a.count),
        topUsers,
        peakHour: '22:00',
      },
      psychology: {
        distribution: sentimentStats.map((s) => ({
          label: s.sentiment,
          count: s._count._all,
        })),
        moodTrend: finalTimeSeries,
        categorySentiments: categorySentimentStats.sort(
          (a, b) => b.avgScore - a.avgScore,
        ),
        volatility: parseFloat((volatility * 10).toFixed(1)),
        emotionalBalance,
        happiestHour: '14:00',
        mostPolarizedCategory: mostPolarizedCat?.name || 'Genel',
        forecast: { label: forecast, icon: forecastIcon },
        influencers: moodInfluencers,
        matrix: moodMatrix,
      },
      solidarity: { categories: solidarityCategories, series: spotSeries },
      aiSummary,
      timeSeries: finalTimeSeries,
    };
  }

  async getRecentPostsByCategory(categoryId: bigint, interval: string = 'day') {
    const now = new Date();
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.prisma.post.findMany({
      where: {
        categoryId,
        createdAt: { gte: startDate },
        isDeleted: false,
        published: true,
      },
      take: 5,
      include: {
        author: { select: { username: true, fullName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTopPostsBySentiment(sentiment: string, interval: string = 'day') {
    const now = new Date();
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.prisma.post.findMany({
      where: {
        sentiment,
        createdAt: { gte: startDate },
        isDeleted: false,
        published: true,
      },
      take: 20,
      include: {
        author: { select: { username: true, fullName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
      orderBy: { likes: { _count: 'desc' } },
    });
  }

  private async refreshMenu() {
    try {
      const { data } = await axios.get(this.YEMEKHANE_URL, { timeout: 10000 });
      const $ = cheerio.load(data);
      const allDays: any[] = [];
      $('.grid.grid-cols-1.md\\:grid-cols-5')
        .find('> div')
        .each((i, dayDiv) => {
          const dayName = $(dayDiv)
            .find('.text-md.text-slate-700.font-semibold')
            .first()
            .text()
            .trim();
          if (dayName) {
            const items: string[] = [];
            $(dayDiv)
              .find('.text-md.border-b')
              .each((j, itemDiv) => {
                const text = $(itemDiv).text().trim();
                if (
                  text &&
                  text !== dayName &&
                  !text.toLowerCase().includes('kalori')
                )
                  items.push(text);
              });
            allDays.push({ day: dayName, items });
          }
        });
      if (allDays.length >= 5)
        this.cachedMenu = {
          thisWeek: allDays.slice(0, 5),
          nextWeek: allDays.slice(5, 10),
        };
    } catch (e) {
      this.logger.error('Scraper error');
    }
  }

  async getCafeteriaMenu() {
    return this.cachedMenu;
  }
}
