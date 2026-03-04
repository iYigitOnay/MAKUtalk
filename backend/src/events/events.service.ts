import { Injectable, ForbiddenException, NotFoundException, UnauthorizedException, Logger, OnModuleInit } from '@nestjs/common';
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

  // JSON içindeki etkinlik listesini her nerede olursa olsun bulan akıllı fonksiyon
  private findEventsArray(obj: any): any[] | null {
    if (!obj) return null;
    if (Array.isArray(obj)) {
      // Bu dizi etkinlik listesine benziyor mu?
      if (obj.length > 0) {
        const first = obj[0];
        // MAKÜ API yapısında 'datas' veya 'title' araması
        if ((first.datas && Array.isArray(first.datas)) || (first.title && first.event_date)) {
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

      this.logger.log(`API İsteği atılıyor: ${this.UNIVERSITY_API_URL}`);
      const { data: response } = await axios.get(this.UNIVERSITY_API_URL, {
        timeout: 15000,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://www.mehmetakif.edu.tr/'
        }
      });

      // AKILLI ARAMA: Veriyi JSON'un her yerinde ara
      const rawEvents = this.findEventsArray(response);
      
      if (!rawEvents) {
        this.logger.error('API Yanıtında etkinlik listesi bulunamadı. Gelen yapı: ' + Object.keys(response).join(', '));
        throw new Error('Veri yapısı çözülemedi.');
      }

      this.logger.log(`Robot toplam ${rawEvents.length} adet ham veri yakaladı.`);

      let savedCount = 0;
      for (const item of rawEvents) {
        // MAKÜ API'sinde asıl veri genelde 'datas[0]' içindedir
        const eventData = item.datas?.[0] || item;
        const title = eventData.title || item.title;
        const dateRaw = eventData.event_date || item.doing_at || item.publish_at;
        
        if (!title || !dateRaw) continue;

        const date = new Date(dateRaw);
        if (isNaN(date.getTime())) continue; // Geçersiz tarihleri atla

        const cleanLocation = eventData.event_address 
          ? eventData.event_address.replace(/<\/?[^>]+(>|$)/g, "").trim() 
          : 'MAKÜ Kampüsü';

        const fullImageUrl = eventData.attachment?.file_url 
          ? `https://depo.mehmetakif.edu.tr${eventData.attachment.file_url}`
          : (item.attachment?.file_url ? `https://depo.mehmetakif.edu.tr${item.attachment.file_url}` : null);

        // Mükerrer kontrolü
        const exists = await (this.prisma as any).event.findFirst({
          where: { title: title, date: date }
        });

        if (!exists) {
          await (this.prisma as any).event.create({
            data: {
              title: title.substring(0, 150),
              description: 'Bu etkinlik MAKÜ resmi duyuru sisteminden otomatik olarak senkronize edilmiştir.',
              date: date,
              location: cleanLocation.substring(0, 100),
              campus: 'Merkez',
              type: (item.event_type?.name || 'ETKİNLİK').toUpperCase(),
              imageUrl: fullImageUrl,
              creatorId: systemUser.id
            }
          });
          savedCount++;
        }
      }

      this.logger.log(`${savedCount} yeni resmi etkinlik başarıyla biletlere dönüştürüldü.`);
      return { success: true, saved: savedCount };
    } catch (error) {
      this.logger.error('Senkronizasyon hatası:', error.message);
      throw new ForbiddenException(`Robot başarısız oldu: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('Geçmiş etkinlikler temizleniyor...');
    const now = new Date();
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
    const events = await (this.prisma as any).event.findMany({
      where: { date: { gte: new Date() } },
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
    await (this.prisma as any).event.delete({ where: { id: eventId } });
    return { success: true };
  }
}
