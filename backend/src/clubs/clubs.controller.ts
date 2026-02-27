import { Controller, Get, Param, Post, Body, UseGuards, Query, Delete } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  findAll(@Query('currentUserId') currentUserId?: string) {
    return this.clubsService.findAll(currentUserId ? +currentUserId : undefined);
  }

  // Bekleyen başvurular (Admin ve Akademisyen için)
  @Get('pending')
  @UseGuards(JwtAuthGuard)
  getPending(@CurrentUser() user: any) {
    if (user.role === 'ADMIN') {
      return this.clubsService.getPendingProposalsForAdmin();
    } else if (user.role === 'ACADEMIC') {
      return this.clubsService.getProposalsForAcademic(user.email);
    }
    return [];
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string, @Query('currentUserId') currentUserId?: string) {
    return this.clubsService.findOne(slug, currentUserId ? +currentUserId : undefined);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() data: any) {
    return this.clubsService.createProposal(user.id, data);
  }

  // Akademisyen Onayı
  @Post(':id/approve-academic')
  @UseGuards(JwtAuthGuard)
  approveAcademic(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clubsService.approveByAcademic(user.id, +id);
  }

  // Admin Onayı
  @Post(':id/approve-admin')
  @UseGuards(JwtAuthGuard)
  approveAdmin(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clubsService.approveByAdmin(user.id, +id);
  }

  // Başvuru Reddet
  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  reject(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clubsService.rejectProposal(user.id, +id);
  }

  @Post(':id/toggle-join')
  @UseGuards(JwtAuthGuard)
  toggleJoin(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clubsService.toggleJoin(user.id, +id);
  }

  // ROZET İŞLEMLERİ
  @Get('badges/all')
  getAllBadges() {
    return this.clubsService.getAllBadges();
  }

  @Post(':id/badges')
  @UseGuards(JwtAuthGuard)
  assignBadge(@CurrentUser() user: any, @Param('id') id: string, @Body('badgeId') badgeId: number) {
    return this.clubsService.assignBadge(user.id, +id, badgeId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clubsService.remove(user.id, +id);
  }

  @Post('seed')
  seed() {
    return this.clubsService.createInitialClubs();
  }
}
