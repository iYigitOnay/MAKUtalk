import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  /**
   * Son 7 gündeki post sayısına göre kategorileri getirir
   */
  async getTrending() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Tüm kategorileri alıyoruz
    const categories = await this.prisma.category.findMany();

    // Her kategori için son 7 gündeki post sayılarını sayıyoruz
    const trending = await Promise.all(
      categories.map(async (category) => {
        const count = await this.prisma.post.count({
          where: {
            categoryId: category.id,
            createdAt: { gte: sevenDaysAgo },
          },
        });
        return {
          ...category,
          weeklyPostCount: count,
        };
      }),
    );

    // Sayısı 0'dan büyük olanları büyükten küçüğe sıralayıp döndürüyoruz
    return trending
      .filter((c) => c.weeklyPostCount > 0)
      .sort((a, b) => b.weeklyPostCount - a.weeklyPostCount);
  }

  async findOne(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
    });
  }
}
