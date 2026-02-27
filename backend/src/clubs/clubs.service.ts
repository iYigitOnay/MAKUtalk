import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: number) {
    const clubs = await (this.prisma as any).club.findMany({
      where: { status: 'APPROVED' },
      orderBy: { name: 'asc' },
      include: { _count: { select: { members: true } }, badges: { include: { badge: true } } }
    });

    if (userId) {
      const memberships = await (this.prisma as any).clubMember.findMany({
        where: { userId },
        select: { clubId: true }
      });
      const joinedClubIds = new Set(memberships.map((m: any) => m.clubId));
      return clubs.map((club: any) => ({
        ...club,
        isJoined: joinedClubIds.has(club.id),
        memberCount: club._count.members,
        earnedBadges: club.badges.map((b: any) => b.badge)
      }));
    }
    return clubs.map((club: any) => ({ ...club, memberCount: club._count.members, earnedBadges: club.badges.map((b: any) => b.badge) }));
  }

  async getPendingProposalsForAdmin() {
    return (this.prisma as any).club.findMany({
      where: { status: 'PENDING' },
      include: { 
        founder: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        advisor: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getProposalsForAcademic(email: string) {
    return (this.prisma as any).club.findMany({
      where: { advisorEmail: email, status: 'PENDING' },
      include: { 
        founder: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        advisor: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approveByAcademic(userId: number, clubId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ACADEMIC') throw new ForbiddenException('Yetkiniz yok.');
    return (this.prisma as any).club.update({ where: { id: clubId }, data: { academicApproval: true } });
  }

  async approveByAdmin(userId: number, clubId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') throw new ForbiddenException('Yetkiniz yok.');
    const updatedClub = await (this.prisma as any).club.update({ where: { id: clubId }, data: { adminApproval: true, status: 'APPROVED' } });
    if (updatedClub.founderId) {
      await (this.prisma as any).clubMember.create({ data: { clubId: updatedClub.id, userId: updatedClub.founderId, role: 'ADMIN' } });
    }
    return updatedClub;
  }

  async rejectProposal(userId: number, clubId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ACADEMIC')) throw new ForbiddenException('Yetkiniz yok.');
    return (this.prisma as any).club.update({ where: { id: clubId }, data: { status: 'REJECTED' } });
  }

  async assignBadge(userId: number, clubId: number, badgeId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const club = await (this.prisma as any).club.findUnique({ where: { id: clubId } });
    
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    if (!club) throw new NotFoundException('Topluluk bulunamadı.');

    const isAdvisor = club.advisorEmail === user.email;
    if (user.role !== 'ADMIN' && !isAdvisor) {
      throw new ForbiddenException('Sadece Admin veya Danışman hoca rozet verebilir.');
    }

    return (this.prisma as any).clubBadge.upsert({
      where: { clubId_badgeId: { clubId, badgeId } },
      update: {},
      create: { clubId, badgeId }
    });
  }

  async getAllBadges() {
    return this.prisma.badge.findMany({ where: { type: 'CLUB' } }); // Sadece topluluk rozetlerini getir
  }

  async createProposal(userId: number, data: any) {
    const { name, category, emoji, color, advisorEmail, description } = data;
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u').replace(/[ş]/g, 's').replace(/[ı]/g, 'i').replace(/[ö]/g, 'o').replace(/[ç]/g, 'c').replace(/[^a-z0-9-]/g, '');
    const existing = await (this.prisma as any).club.findFirst({ where: { OR: [{ name }, { slug }] } });
    if (existing) throw new ConflictException('Bu isimde bir topluluk zaten mevcut.');
    const club = await (this.prisma as any).club.create({ data: { name, category, emoji, color: color || '#e11d48', advisorEmail, description, slug, founderId: userId, status: 'PENDING' } });
    return club;
  }

  async findOne(slug: string, userId?: number) {
    const club = await (this.prisma as any).club.findUnique({
      where: { slug },
      include: {
        founder: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        advisor: { select: { id: true, username: true, fullName: true, avatarUrl: true, email: true } },
        _count: { select: { members: true } },
        badges: { include: { badge: true } }
      }
    });
    if (!club) throw new NotFoundException('Bulunamadı.');
    let isJoined = false;
    if (userId) {
      const membership = await (this.prisma as any).clubMember.findUnique({ where: { clubId_userId: { clubId: club.id, userId } } });
      isJoined = !!membership;
    }
    return { ...club, isJoined, memberCount: club._count.members, advisorUser: club.advisor, earnedBadges: club.badges.map((b: any) => b.badge) };
  }

  async toggleJoin(userId: number, clubId: number) {
    const club = await (this.prisma as any).club.findUnique({ where: { id: clubId, status: 'APPROVED' } });
    if (!club) throw new NotFoundException('Bulunamadı.');
    const existing = await (this.prisma as any).clubMember.findUnique({ where: { clubId_userId: { clubId, userId } } });
    if (existing) { await (this.prisma as any).clubMember.delete({ where: { id: existing.id } }); return { joined: false }; }
    await (this.prisma as any).clubMember.create({ data: { clubId, userId } });
    return { joined: true };
  }

  async remove(userId: number, clubId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') throw new ForbiddenException('Yetkiniz yok.');
    return (this.prisma as any).club.delete({ where: { id: clubId } });
  }

  async createInitialClubs() {
    const initialBadges = [
      { name: "Öncü Ruh", icon: "🏆", color: "#F59E0B", description: "Sistemin kuruluşunda yer alan topluluk.", type: 'CLUB' },
      { name: "Yüzler Kulübü", icon: "💯", color: "#EF4444", description: "100+ üyeye ulaşan büyük topluluk.", type: 'CLUB' },
      { name: "Altın Etkinlik", icon: "🌟", color: "#FACC15", description: "Yılın en ses getiren organizasyonu.", type: 'CLUB' },
      { name: "Akademik Yıldız", icon: "🎓", color: "#10B981", description: "Bilimsel takdir kazanan topluluk.", type: 'CLUB' },
      { name: "Sosyal Kelebek", icon: "🦋", color: "#EC4899", description: "En aktif ve sosyal topluluk.", type: 'CLUB' },
      { name: "Teknoloji Lideri", icon: "💻", color: "#3B82F6", description: "İnovasyon odaklı projeler.", type: 'CLUB' },
      { name: "Doğa Dostu", icon: "🌿", color: "#22C55E", description: "Çevre bilinci yüksek topluluk.", type: 'CLUB' },
      { name: "Zirve Takımı", icon: "🏔️", color: "#6366F1", description: "Her alanda üstün başarı.", type: 'CLUB' }
    ];
    for (const badge of initialBadges) {
      await this.prisma.badge.upsert({ where: { name: badge.name }, update: { type: 'CLUB' as any }, create: badge as any });
    }
    return { message: "Seed OK" };
  }
}
