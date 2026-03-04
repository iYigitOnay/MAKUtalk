import { Controller, Get, Post, Body, Param, Request, UseGuards, Delete, Query } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  // LİSTELEME
  @Get()
  findAll(@Request() req, @Query('currentUserId') currentUserId?: string) {
    const userId = currentUserId ? parseInt(currentUserId) : req.user?.id;
    return this.clubsService.findAll(userId);
  }

  @Get('my-founded')
  @UseGuards(JwtAuthGuard)
  findMyFounded(@Request() req) {
    return this.clubsService.findMyFounded(req.user.id);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  getPending(@Request() req) {
    return this.clubsService.getPendingProposalsForAdmin();
  }

  @Get('academic-proposals')
  @UseGuards(JwtAuthGuard)
  getAcademicProposals(@Request() req) {
    return this.clubsService.getProposalsForAcademic(req.user.email);
  }

  // ONAY & RED (Frontend Formatı: /api/clubs/:id/...)
  @Post(':id/approve-academic')
  @UseGuards(JwtAuthGuard)
  approveAcademic(@Request() req, @Param('id') id: string) {
    return this.clubsService.approveByAcademic(req.user.id, parseInt(id));
  }

  @Post(':id/approve-admin')
  @UseGuards(JwtAuthGuard)
  approveAdmin(@Request() req, @Param('id') id: string) {
    return this.clubsService.approveByAdmin(req.user.id, parseInt(id));
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  reject(@Request() req, @Param('id') id: string) {
    return this.clubsService.rejectProposal(req.user.id, parseInt(id));
  }

  // OLUŞTURMA
  @Post()
  @UseGuards(JwtAuthGuard)
  propose(@Request() req, @Body() data: any) {
    return this.clubsService.createProposal(req.user.id, data);
  }

  // ROZETLER
  @Get('badges/all')
  getBadges() {
    return this.clubsService.getAllBadges();
  }

  @Post(':id/badges')
  @UseGuards(JwtAuthGuard)
  assignBadge(@Request() req, @Param('id') id: string, @Body() data: { badgeId: number }) {
    return this.clubsService.assignBadge(req.user.id, parseInt(id), data.badgeId);
  }

  // ÜYELİK & DETAY
  @Post(':id/toggle-join')
  @UseGuards(JwtAuthGuard)
  toggleJoin(@Request() req, @Param('id') id: string) {
    return this.clubsService.toggleJoin(req.user.id, parseInt(id));
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string, @Request() req) {
    return this.clubsService.findOne(slug, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.clubsService.remove(req.user.id, parseInt(id));
  }

  @Post('seed')
  seed() {
    return this.clubsService.createInitialClubs();
  }
}
