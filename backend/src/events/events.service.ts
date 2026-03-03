import { Injectable, ForbiddenException, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(private prisma: PrismaService) {}

  // OTOMATİK TEMİZLİK: Her gece 00:00'da çalışır
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('Geçmiş etkinlikler temizleniyor...');
    const now = new Date();
    
    const deleteResult = await (this.prisma as any).event.deleteMany({
      where: {
        date: { lt: now } // Şu andan küçük (geçmiş) olanlar
      }
    });

    this.logger.log(`${deleteResult.count} adet geçmiş etkinlik silindi.`);
  }

  async create(userId: number, createEventDto: CreateEventDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { foundedClubs: true }
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı.');
    }

    // YETKİ KONTROLÜ
    const isAdmin = user.role === 'ADMIN' || user.email === '2312101063@ogr.mehmetakif.edu.tr';
    const isAcademic = user.role === 'ACADEMIC';
    
    let isClubOwner = false;
    if (createEventDto.clubId) {
      isClubOwner = user.foundedClubs.some(club => club.id === createEventDto.clubId);
    }

    if (!isAdmin && !isAcademic && !isClubOwner) {
      throw new ForbiddenException('Etkinlik oluşturma yetkiniz bulunmamaktadır.');
    }

    return (this.prisma as any).event.create({
      data: {
        ...createEventDto,
        creatorId: userId,
        date: new Date(createEventDto.date),
      },
      include: {
        creator: { select: { username: true, fullName: true, avatarUrl: true } },
        club: true,
        _count: { select: { participants: true } }
      }
    });
  }

  async findAll(currentUserId?: number) {
    const now = new Date();
    const events = await (this.prisma as any).event.findMany({
      where: {
        date: { gte: now } // Sadece şu andan sonraki etkinlikler
      },
      orderBy: { date: 'asc' },
      include: {
        creator: { select: { username: true, fullName: true, avatarUrl: true } },
        club: true,
        participants: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { avatarUrl: true, username: true } }
          }
        },
        _count: { select: { participants: true } }
      }
    });

    // Mevcut kullanıcının katılıp katılmadığını kontrol etmek için ek bir sorgu gerekebilir 
    // veya gelen tüm katılımcıları kontrol edebiliriz. 
    // Ancak performans için currentUserId ile ayrı bir kontrol daha sağlıklı.
    
    const results = await Promise.all(events.map(async (event: any) => {
      let isAttending = false;
      if (currentUserId) {
        const check = await (this.prisma as any).eventParticipant.findUnique({
          where: { eventId_userId: { eventId: event.id, userId: currentUserId } }
        });
        isAttending = !!check;
      }

      return {
        ...event,
        isAttending,
        displayParticipants: event.participants.map((p: any) => p.user)
      };
    }));

    return results;
  }

  async toggleAttendance(userId: number, eventId: number) {
    const event = await (this.prisma as any).event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Etkinlik bulunamadı.');

    const existingParticipation = await (this.prisma as any).eventParticipant.findUnique({
      where: { eventId_userId: { eventId, userId } }
    });

    if (existingParticipation) {
      await (this.prisma as any).eventParticipant.delete({
        where: { id: existingParticipation.id }
      });
      return { attending: false };
    } else {
      await (this.prisma as any).eventParticipant.create({
        data: { eventId, userId }
      });
      return { attending: true };
    }
  }

  async remove(userId: number, eventId: number) {
    const event = await (this.prisma as any).event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Etkinlik bulunamadı.');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const isAdmin = user.role === 'ADMIN' || user.email === '2312101063@ogr.mehmetakif.edu.tr';

    if (event.creatorId !== userId && !isAdmin) {
      throw new ForbiddenException('Bu etkinliği silme yetkiniz yok.');
    }

    return (this.prisma as any).event.delete({ where: { id: eventId } });
  }
}
