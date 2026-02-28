import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpotService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    return (this.prisma as any).spotListing.findMany({
      where: category ? { category: category as any, status: 'ACTIVE' } : { status: 'ACTIVE' },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findMyListings(userId: number) {
    return (this.prisma as any).spotListing.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number) {
    const listing = await (this.prisma as any).spotListing.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatarUrl: true }
        }
      }
    });
    if (!listing) throw new NotFoundException('İlan bulunamadı.');
    return listing;
  }

  async create(userId: number, data: any) {
    // Sadece Prisma şemasındaki alanları tek tek eşleştiriyoruz (Garanti Yöntem)
    return (this.prisma as any).spotListing.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price ? parseFloat(data.price.toString()) : null,
        category: data.category,
        location: data.location || null,
        contactInfo: data.contactInfo || null,
        imageUrl: data.imageUrl || null,
        authorId: userId,
        status: 'ACTIVE'
      }
    });
  }

  async updateStatus(userId: number, id: number, status: string) {
    const listing = await (this.prisma as any).spotListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('İlan bulunamadı.');
    if (listing.authorId !== userId) throw new ForbiddenException('Yetkiniz yok.');

    return (this.prisma as any).spotListing.update({
      where: { id },
      data: { status: status as any }
    });
  }

  async remove(userId: number, id: number) {
    const listing = await (this.prisma as any).spotListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('İlan bulunamadı.');
    
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    
    if (listing.authorId !== userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Yetkiniz yok.');
    }

    return (this.prisma as any).spotListing.delete({ where: { id } });
  }
}
