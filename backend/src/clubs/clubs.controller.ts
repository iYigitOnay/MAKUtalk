import { Controller, Get, Post, Body, Param, Request, UseGuards, Delete, Query } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get('all')
  findAll(@Request() req) {
    return this.clubsService.findAll(req.user?.id);
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

  @Post('approve-academic/:id')
  @UseGuards(JwtAuthGuard)
  approveAcademic(@Request() req, @Param('id') id: string) {
    return this.clubsService.approveByAcademic(req.user.id, parseInt(id));
  }

  @Post('approve-admin/:id')
  @UseGuards(JwtAuthGuard)
  approveAdmin(@Request() req, @Param('id') id: string) {
    return this.clubsService.approveByAdmin(req.user.id, parseInt(id));
  }

  @Post('reject/:id')
  @UseGuards(JwtAuthGuard)
  reject(@Request() req, @Param('id') id: string) {
    return this.clubsService.rejectProposal(req.user.id, parseInt(id));
  }

  @Post('propose')
  @UseGuards(JwtAuthGuard)
  propose(@Request() req, @Body() data: any) {
    return this.clubsService.createProposal(req.user.id, data);
  }

  @Post('assign-badge')
  @UseGuards(JwtAuthGuard)
  assignBadge(@Request() req, @Body() data: { clubId: number, badgeId: number }) {
    return this.clubsService.assignBadge(req.user.id, data.clubId, data.badgeId);
  }

  @Get('badges')
  getBadges() {
    return this.clubsService.getAllBadges();
  }

  @Post('toggle-join/:id')
  @UseGuards(JwtAuthGuard)
  toggleJoin(@Request() req, @Param('id') id: string) {
    return this.clubsService.toggleJoin(req.user.id, parseInt(id));
  }

  @Get('detail/:slug')
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
