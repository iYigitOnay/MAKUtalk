import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Param, 
  Body, 
  UseGuards, 
  ForbiddenException, 
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChatGateway } from '../chat/chat.gateway';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  private checkAdmin(user: any) {
    if (user.role !== 'ADMIN' && user.email !== '2312101063@ogr.mehmetakif.edu.tr') {
      throw new ForbiddenException('Yönetici yetkisi gerekli.');
    }
  }

  @Get('stats')
  async getStats(@CurrentUser() user) {
    this.checkAdmin(user);
    try {
      const chartData: { date: string; _count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const count = await this.prisma.post.count({
          where: { createdAt: { gte: new Date(dateString + 'T00:00:00.000Z'), lte: new Date(dateString + 'T23:59:59.999Z') }, isDeleted: false }
        });
        chartData.push({ date: dateString, _count: count });
      }

      const [uCount, rCount, fCount, cCount, pCount, sCount, recentU, sentimentS] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.report.count({ where: { status: 'PENDING' } }),
        this.prisma.feedback.count(),
        this.prisma.club.count({ where: { status: 'PENDING' } }),
        this.prisma.post.count({ where: { isDeleted: false } }),
        this.prisma.spotListing.count({ where: { status: 'ACTIVE' } }),
        this.prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, username: true, avatarUrl: true } }),
        this.prisma.post.groupBy({ by: ['sentiment'], where: { isDeleted: false, NOT: { sentiment: null } }, _count: true })
      ]);

      return {
        totalUsers: uCount,
        totalReports: rCount,
        totalFeedbacks: fCount,
        pendingClubsCount: cCount,
        totalPosts: pCount,
        totalSpot: sCount,
        onlineUsers: ChatGateway.getOnlineCount(),
        recentUsers: recentU.map(u => ({ ...u, isOnline: ChatGateway.isUserOnline(u.id) })),
        chartData: { posts: chartData, sentiment: sentimentS }
      };
    } catch (e) {
      return { error: 'Veri hatası' };
    }
  }

  @Get('users')
  async getUsers(@CurrentUser() user) {
    this.checkAdmin(user);
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map(u => ({ ...u, isOnline: ChatGateway.isUserOnline(u.id) }));
  }

  @Patch('users/:id/ban')
  async toggleBan(@CurrentUser() user, @Param('id') targetId: string) {
    this.checkAdmin(user);
    const id = BigInt(targetId);
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException();
    return this.prisma.user.update({ where: { id }, data: { isBanned: !target.isBanned } });
  }

  @Patch('users/:id/role')
  async updateRole(@CurrentUser() user, @Param('id') targetId: string, @Body('role') role: any) {
    this.checkAdmin(user);
    return this.prisma.user.update({ where: { id: BigInt(targetId) }, data: { role } });
  }

  @Get('reports')
  async getReports(@CurrentUser() user) {
    this.checkAdmin(user);
    return this.prisma.report.findMany({
      where: { status: 'PENDING' },
      include: {
        reporter: { select: { username: true, avatarUrl: true } },
        reportedPost: { select: { content: true, author: { select: { username: true } } } },
        reportedComment: { select: { content: true, user: { select: { username: true } } } },
        reportedMessage: { select: { id: true, content: true, sender: { select: { username: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Patch('reports/:id/status')
  async updateReportStatus(@CurrentUser() user, @Param('id') id: string, @Body('status') status: string) {
    this.checkAdmin(user);
    return this.prisma.report.update({ where: { id: BigInt(id) }, data: { status } });
  }

  @Get('clubs')
  async getClubs(@CurrentUser() user) {
    this.checkAdmin(user);
    return this.prisma.club.findMany({ 
      include: { founder: { select: { username: true, avatarUrl: true } } }, 
      orderBy: { createdAt: 'desc' } 
    });
  }

  @Patch('clubs/:id/approve')
  async approveClub(@CurrentUser() user, @Param('id') id: string, @Body('type') type: string) {
    this.checkAdmin(user);
    const clubId = BigInt(id);
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException();
    const data: any = {};
    if (type === 'admin') data.adminApproval = true;
    else data.academicApproval = true;
    
    // Eğer her iki taraf da onaylamışsa veya tek bir onay ile status değişiyorsa logic burada
    if ((type === 'admin' || club.adminApproval) && (type === 'academic' || club.academicApproval)) {
      data.status = 'APPROVED';
    }
    
    return this.prisma.club.update({ where: { id: clubId }, data });
  }

  @Get('spot')
  async getSpot(@CurrentUser() user) {
    this.checkAdmin(user);
    return this.prisma.spotListing.findMany({ 
      where: { status: 'ACTIVE' },
      include: { author: { select: { username: true, avatarUrl: true } } }, 
      orderBy: { createdAt: 'desc' } 
    });
  }

  @Delete('spot/:id')
  async deleteSpot(@CurrentUser() user, @Param('id') id: string) {
    this.checkAdmin(user);
    return this.prisma.spotListing.update({ where: { id: BigInt(id) }, data: { status: 'CLOSED' } });
  }

  @Get('trends')
  async getTrends(@CurrentUser() user) {
    this.checkAdmin(user);
    const posts = await this.prisma.post.findMany({ 
      where: { isDeleted: false, content: { contains: '#' } },
      select: { content: true }
    });
    
    const tagsMap: Record<string, number> = {};
    posts.forEach(p => {
      const tags = p.content?.match(/#[\wığüşöçİĞÜŞÖÇ]+/g);
      if (tags) {
        tags.forEach(t => {
          const cleanTag = t.replace('#', '').toLowerCase();
          tagsMap[cleanTag] = (tagsMap[cleanTag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, _count: { posts: count } }));
  }

  @Get('feedbacks')
  async getFeedbacks(@CurrentUser() user) {
    this.checkAdmin(user);
    return this.prisma.feedback.findMany({
      include: { 
        user: { 
          select: { 
            id: true, 
            username: true, 
            avatarUrl: true,
            email: true 
          } 
        } 
      }, 
      orderBy: { createdAt: 'desc' } 
    });
  }

  @Get('events')
  async getEvents(@CurrentUser() user) {
    this.checkAdmin(user);
    return this.prisma.event.findMany({
      include: { 
        creator: { select: { username: true, avatarUrl: true } },
        _count: { select: { participants: true } }
      },
      orderBy: { date: 'desc' }
    });
  }

  @Delete('events/:id')
  async deleteEvent(@CurrentUser() user, @Param('id') id: string) {
    this.checkAdmin(user);
    return this.prisma.event.delete({ where: { id: BigInt(id) } });
  }

  @Get('logs')
  async getLogs(@CurrentUser() user) {
    this.checkAdmin(user);
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(process.cwd(), 'logs');
    try {
      const files = fs.readdirSync(logPath).filter(f => f.endsWith('-combined.log'));
      if (files.length === 0) return [];
      const latestFile = files.sort().reverse()[0];
      const content = fs.readFileSync(path.join(logPath, latestFile), 'utf8');
      return content.split('\n').filter(l => l.trim()).map(l => {
        try { return JSON.parse(l); } catch(e) { return { message: l, level: 'info', timestamp: new Date() }; }
      }).reverse().slice(0, 100);
    } catch (e) { 
      return [{ message: 'Log dosyasına erişilemedi.', level: 'error', timestamp: new Date() }]; 
    }
  }

  @Post('announce')
  async createAnnouncement(@CurrentUser() user, @Body() data: any) {
    this.checkAdmin(user);
    return { success: true };
  }

  @Delete('posts/:id')
  async deletePost(@CurrentUser() user, @Param('id') id: string) {
    this.checkAdmin(user);
    return this.prisma.post.update({ where: { id: BigInt(id) }, data: { isDeleted: true } });
  }

  @Delete('comments/:id')
  async deleteComment(@CurrentUser() user, @Param('id') id: string) {
    this.checkAdmin(user);
    return this.prisma.comment.update({ where: { id: BigInt(id) }, data: { isDeleted: true } });
  }

  @Delete('messages/:id')
  async deleteMessage(@CurrentUser() user, @Param('id') id: string) {
    this.checkAdmin(user);
    return this.prisma.message.update({ where: { id: BigInt(id) }, data: { isDeleted: true } });
  }
}
