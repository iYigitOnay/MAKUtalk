import { Controller, Get, UseGuards, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  private checkAdmin(user: any) {
    // CurrentUser'dan gelen nesnenin yapısına göre kontrol edelim
    const email = user.email;
    const role = user.role;
    
    if (role !== 'ADMIN' && email !== '2312101063@ogr.mehmetakif.edu.tr') {
      throw new ForbiddenException('Bu bölüme erişim yetkiniz yok.');
    }
  }

  @Get('stats')
  async getStats(@CurrentUser() user) {
    this.checkAdmin(user);
    const prisma = this.prisma as any;
    const [totalUsers, totalReports, totalFeedbacks] = await Promise.all([
      this.prisma.user.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.feedback.count(),
    ]);

    return {
      totalUsers,
      totalReports,
      totalFeedbacks,
    };
  }

  @Get('users')
  async getUsers(@CurrentUser() user) {
    this.checkAdmin(user);
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
    });
  }

  @Get('feedbacks')
  async getFeedbacks(@CurrentUser() user) {
    this.checkAdmin(user);
    return (this.prisma as any).feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  @Get('reports')
  async getReports(@CurrentUser() user) {
    this.checkAdmin(user);
    return (this.prisma as any).report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { username: true } },
        reportedUser: { select: { username: true } },
        reportedPost: { select: { id: true, content: true } }
      },
    });
  }
}
