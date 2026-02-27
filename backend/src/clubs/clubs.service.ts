import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: number) {
    const clubs = await (this.prisma as any).club.findMany({
      where: { status: 'APPROVED' },
      orderBy: { name: 'asc' },
      include: { _count: { select: { members: true } } }
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
        memberCount: club._count.members
      }));
    }
    return clubs.map((club: any) => ({ ...club, memberCount: club._count.members }));
  }

  async getPendingProposalsForAdmin() {
    return (this.prisma as any).club.findMany({
      where: { status: 'PENDING' },
      include: { founder: { select: { id: true, username: true, fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getProposalsForAcademic(email: string) {
    return (this.prisma as any).club.findMany({
      where: { advisorEmail: email, status: 'PENDING' },
      include: { founder: { select: { id: true, username: true, fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approveByAcademic(userId: number, clubId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ACADEMIC') throw new ForbiddenException('Yetkiniz yok.');
    const club = await (this.prisma as any).club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Başvuru bulunamadı.');
    return (this.prisma as any).club.update({ where: { id: clubId }, data: { academicApproval: true } });
  }

  async approveByAdmin(userId: number, clubId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') throw new ForbiddenException('Yetkiniz yok.');
    const club = await (this.prisma as any).club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Başvuru bulunamadı.');
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

  async createProposal(userId: number, data: any) {
    const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u').replace(/[ş]/g, 's').replace(/[ı]/g, 'i').replace(/[ö]/g, 'o').replace(/[ç]/g, 'c');
    const existing = await (this.prisma as any).club.findFirst({ where: { OR: [{ name: data.name }, { slug }] } });
    if (existing) throw new ConflictException('Bu isimde bir topluluk zaten mevcut.');
    const club = await (this.prisma as any).club.create({ data: { ...data, slug, founderId: userId, status: 'PENDING' } });
    if (data.advisorEmail) {
      try {
        const academic = await this.prisma.user.findUnique({ where: { email: data.advisorEmail } });
        if (academic) { await (this.prisma as any).notification.create({ data: { type: 'FOLLOW', recipientId: academic.id, senderId: userId, read: false } }); }
      } catch (err) { console.warn("Notification error:", err.message); }
    }
    return club;
  }

  async findOne(slug: string, userId?: number) {
    const club = await (this.prisma as any).club.findUnique({ where: { slug }, include: { founder: { select: { id: true, username: true, fullName: true, avatarUrl: true } }, _count: { select: { members: true } } } });
    if (!club) throw new NotFoundException('Bulunamadı.');
    let isJoined = false;
    if (userId) {
      const membership = await (this.prisma as any).clubMember.findUnique({ where: { clubId_userId: { clubId: club.id, userId } } });
      isJoined = !!membership;
    }
    return { ...club, isJoined, memberCount: club._count.members };
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
    const initialClubs = [
      { name: "Yazılım ve Bilişim Topluluğu", slug: "yazilim-bilisim", description: "Kod dünyasında projeler üretmek.", category: "BİLİM", emoji: "💻", status: "APPROVED", adminApproval: true, academicApproval: true },
      { name: "Tiyatro Topluluğu", slug: "tiyatro", description: "Sahne ışıklarının altında kendini bul.", category: "SANAT", emoji: "🎭", status: "APPROVED", adminApproval: true, academicApproval: true }
    ];
    for (const club of initialClubs) {
      await (this.prisma as any).club.upsert({ where: { slug: club.slug }, update: { status: 'APPROVED', adminApproval: true }, create: club });
    }
    return { message: "Seed OK" };
  }
}
