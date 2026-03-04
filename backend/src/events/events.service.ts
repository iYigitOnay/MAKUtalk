import { Injectable, ForbiddenException, NotFoundException, UnauthorizedException, Logger, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import axios from 'axios';

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name);
  private readonly UNIVERSITY_API_URL = 'https://depo.mehmetakif.edu.tr/api/v1/front/www.mehmetakif.edu.tr/tr/contents/46/1/-';
  
  constructor(private prisma: PrismaService) {}

  async onModuleInit() { }

  @Cron('0 1 * * 1')
  async handleAutoScrape() {
    this.logger.log('MAKÜ Resmi etkinlikleri API üzerinden çekiliyor...');
    await this.scrapeUniversityEvents();
  }

  private findEventsArray(obj: any): any[] | null {
    if (!obj) return null;
    if (Array.isArray(obj)) {
      if (obj.length > 0) {
        const first = obj[0];
        if ((first.datas && Array.isArray(first.datas)) || (first.title && (first.event_date || first.doing_at))) {
          return obj;
        }
      }
    }
    if (typeof obj === 'object') {
      for (const key in obj) {
        const result = this.findEventsArray(obj[key]);
        if (result) return result;
      }
    }
    return null;
  }

  async scrapeUniversityEvents() {
    try {
      const systemUser = await this.prisma.user.upsert({
        where: { email: 'info@mehmetakif.edu.tr' },
        update: {},
        create: {
          email: 'info@mehmetakif.edu.tr',
          username: 'MAKÜ',
          fullName: 'MAKÜ Bilgi Sistemi',
          password: 'system_secure_pass_123',
          role: 'ADMIN',
          isVerified: true
        }
      });

      const { data: response } = await axios.get(this.UNIVERSITY_API_URL, {
        timeout: 20000,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://www.mehmetakif.edu.tr/'
        }
      });

      const rawEvents = this.findEventsArray(response);
      if (!rawEvents) throw new Error('Veri yapısı çözülemedi.');

      let savedCount = 0;
      for (const item of rawEvents) {
        const eventData = item.datas?.[0] || item;
        const title = eventData.title || item.title;
        const dateRaw = eventData.event_date || item.doing_at || item.publish_at;
        
        if (!title || !dateRaw) continue;
        const date = new Date(dateRaw);
        if (isNaN(date.getTime())) continue;

        const exists = await (this.prisma as any).event.findFirst({
          where: { title: title, date: date }
        });

        if (!exists) {
          await (this.prisma as any).event.create({
            data: {
              title: title.substring(0, 150),
              description: 'Bu etkinlik MAKÜ resmi duyuru sisteminden otomatik olarak senkronize edilmiştir.',
              date: date,
              location: (eventData.event_address || 'MAKÜ Kampüsü').replace(/<\/?[^>]+(>|$)/g, "").trim().substring(0, 100),
              campus: 'Merkez',
              type: (item.event_type?.name || 'ETKİNLİK').toUpperCase(),
              imageUrl: eventData.attachment?.file_url ? `https://depo.mehmetakif.edu.tr${eventData.attachment.file_url}` : null,
              creatorId: systemUser.id
            }
          });
          savedCount++;
        }
      }
      return { success: true, saved: savedCount };
    } catch (error) {
      this.logger.error('Senkronizasyon hatası:', error.message);
      throw new InternalServerErrorException(`Robot hatası: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    await (this.prisma as any).event.deleteMany({ where: { date: { lt: now } } });
  }

  async create(userId: number, createEventDto: CreateEventDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return (this.prisma as any).event.create({
      data: { ...createEventDto, creatorId: userId, date: new Date(createEventDto.date) },
      include: { creator: { select: { username: true, fullName: true, avatarUrl: true } }, club: true, _count: { select: { participants: true } } }
    });
  }

  async findAll(currentUserId?: number) {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Bugün başlayan etkinlikleri de göster
    
    const events = await (this.prisma as any).event.findMany({
      where: { date: { gte: now } },
      orderBy: { date: 'asc' },
      include: {
        creator: { select: { username: true, fullName: true, avatarUrl: true } },
        club: true,
        participants: { take: 3, orderBy: { createdAt: 'desc' }, include: { user: { select: { avatarUrl: true, username: true } } } },
        _count: { select: { participants: true } }
      }
    });

    return Promise.all(events.map(async (event: any) => {
      let isAttending = false;
      if (currentUserId) {
        const check = await (this.prisma as any).eventParticipant.findUnique({ where: { eventId_userId: { eventId: event.id, userId: currentUserId } } });
        isAttending = !!check;
      }
      return { ...event, isAttending, displayParticipants: event.participants.map((p: any) => p.user) };
    }));
  }

  async toggleAttendance(userId: number, eventId: number) {
    const event = await (this.prisma as any).event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException();
    const existing = await (this.prisma as any).eventParticipant.findUnique({ where: { eventId_userId: { eventId, userId } } });
    if (existing) { await (this.prisma as any).eventParticipant.delete({ where: { id: existing.id } }); return { attending: false }; }
    else { await (this.prisma as any).eventParticipant.create({ data: { eventId, userId } }); return { attending: true }; }
  }

  async remove(userId: number, eventId: number) {
    const event = await (this.prisma as any).event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException();
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN' || user?.email === '2312101063@ogr.mehmetakif.edu.tr';
    if (event.creatorId !== userId && !isAdmin) throw new ForbiddenException();
    return (this.prisma as any).event.delete({ where: { id: eventId } });
  }
}
