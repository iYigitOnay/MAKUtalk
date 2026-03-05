import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: number, mainType?: string, category?: string) {
    // 1. OTOMATİK TEMİZLİK: Süresi geçmiş olanları DB'den kalıcı olarak sil
    try {
      await (this.prisma as any).club.deleteMany({
        where: {
          deadline: { lt: new Date() }
        }
      });
    } catch (e) {
      console.error("Otomatik temizleme hatası:", e);
    }

    // 2. LİSTELEME: Sadece güncel ve onaylı olanları getir
    const where: any = { status: 'APPROVED' };
    if (mainType && mainType !== 'ALL') where.mainType = mainType;
    if (category && category !== 'TÜMÜ') where.category = category;

    const clubs = await (this.prisma as any).club.findMany({
      where,
      include: {
        founder: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        _count: { select: { members: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!userId) {
      return clubs.map((c: any) => ({ ...c, memberCount: c._count.members, isJoined: false }));
    }

    const memberships = await (this.prisma as any).clubMember.findMany({
      where: { userId }
    });
    const joinedIds = new Set(memberships.map((m: any) => m.clubId));

    return clubs.map((c: any) => ({
      ...c,
      memberCount: c._count.members,
      isJoined: joinedIds.has(c.id)
    }));
  }

  async findMyFounded(userId: number) {
    return (this.prisma as any).club.findMany({
      where: { founderId: userId },
      include: { _count: { select: { members: true } } }
    });
  }

  async getPendingProposalsForAdmin() {
    return (this.prisma as any).club.findMany({
      where: { status: 'PENDING', adminApproval: false },
      include: { founder: true }
    });
  }

  async getProposalsForAcademic(email: string) {
    return (this.prisma as any).club.findMany({
      where: { advisorEmail: email, academicApproval: false, status: 'PENDING' },
      include: { founder: true }
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
    const badge = await this.prisma.badge.findUnique({ where: { id: badgeId } });
    
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    if (!club) throw new NotFoundException('Topluluk bulunamadı.');
    if (!badge || badge.type !== 'CLUB') throw new ForbiddenException('Bu rozet topluluklara atanamaz.');

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

  async createProposal(userId: number, data: any) {
    const { name, category, emoji, color, advisorEmail, description, maxMembers, deadline, requiredSkills, metadata, mainType } = data;
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    const existing = await (this.prisma as any).club.findFirst({ where: { OR: [{ name }, { slug }] } });
    if (existing) throw new ConflictException('Bu isimde bir topluluk zaten mevcut.');

    const club = await (this.prisma as any).club.create({ 
      data: { 
        name, 
        mainType: mainType || 'DIGITAL',
        category, 
        emoji, 
        color: color || '#e11d48', 
        advisorEmail: advisorEmail && advisorEmail.trim() !== "" ? advisorEmail : null, 
        description, 
        slug, 
        founderId: userId, 
        status: 'PENDING',
        maxMembers: maxMembers ? parseInt(maxMembers) : null,
        deadline: deadline ? new Date(deadline) : null,
        requiredSkills,
        metadata: metadata || null
      } 
    });
    return club;
  }

  async findOne(slug: string, userId?: number) {
    const club = await (this.prisma as any).club.findUnique({
      where: { slug },
      include: {
        founder: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        advisor: { select: { id: true, username: true, fullName: true, avatarUrl: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
          }
        },
        badges: { include: { badge: true } }
      }
    });
    if (!club) throw new NotFoundException('Bulunamadı.');
    let isJoined = false;
    if (userId) {
      const membership = await (this.prisma as any).clubMember.findUnique({ where: { clubId_userId: { clubId: club.id, userId } } });
      isJoined = !!membership;
    }
    return { 
      ...club, 
      isJoined, 
      memberCount: club.members.length, 
      members: club.members.map((m: any) => m.user),
      advisorUser: club.advisor, 
      earnedBadges: club.badges.map((b: any) => b.badge) 
    };
  }

  async toggleJoin(userId: number, clubId: number) {
    const club = await (this.prisma as any).club.findUnique({ 
      where: { id: clubId, status: 'APPROVED' },
      include: { _count: { select: { members: true } } }
    });
    if (!club) throw new NotFoundException('Bulunamadı.');

    const existing = await (this.prisma as any).clubMember.findUnique({ where: { clubId_userId: { clubId, userId } } });
    
    // Ayrılma işlemi her zaman yapılabilir
    if (existing) {
      await (this.prisma as any).clubMember.delete({ where: { id: existing.id } });
      return { joined: false };
    }

    // Katılma Kontrolü: Kontenjan dolmuş mu?
    if (club.maxMembers && club._count.members >= club.maxMembers) {
      throw new ForbiddenException('Maalesef kontenjan dolu.');
    }

    await (this.prisma as any).clubMember.create({ data: { clubId, userId } });
    return { joined: true };
  }

  async getAllBadges() {
    return this.prisma.badge.findMany({ where: { type: 'CLUB' } });
  }

  async remove(userId: number, clubId: number, userRole: string) {
    const club = await (this.prisma as any).club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Bulunamadı.');

    // Silme Yetkisi: Kurucu OR Admin OR Akademisyen
    if (club.founderId !== userId && userRole !== 'ADMIN' && userRole !== 'ACADEMIC') {
      throw new ForbiddenException('Yetkiniz yok.');
    }

    return (this.prisma as any).club.delete({ where: { id: clubId } });
  }

  async createInitialClubs() {
    const initialBadges = [
      { name: 'Aktif Topluluk', icon: '🔥', color: '#EF4444', type: 'CLUB' },
      { name: 'Resmi Kulüp', icon: '🛡️', color: '#10B981', type: 'CLUB' },
      { name: 'Sosyal Kelebek', icon: '🦋', color: '#8B5CF6', type: 'CLUB' },
      { name: 'Teknoloji Öncüsü', icon: '💻', color: '#3B82F6', type: 'CLUB' }
    ];
    for (const badge of initialBadges) {
      await this.prisma.badge.upsert({ where: { name: badge.name }, update: { type: 'CLUB' as any }, create: badge as any });
    }
    return { message: "Seed OK" };
  }
}
