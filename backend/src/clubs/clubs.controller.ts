import { Controller, Get, Post, Body, Param, Request, UseGuards, Delete, Query } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  findAll(@Query('userId') userId?: string, @Query('mainType') mainType?: string, @Query('category') category?: string) {
    return this.clubsService.findAll(userId ? parseInt(userId) : undefined, mainType, category);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  getPendingProposals(@Request() req) {
    return this.clubsService.getPendingProposalsForAdmin();
  }

  @Get('badges/all')
  getAllBadges() {
    return this.clubsService.getAllBadges();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string, @Query('currentUserId') userId?: string) {
    // Not: Frontend'den bazen query ile bazen header ile gelebilir. 
    // En sağlamı findOne içinde her iki durumu da desteklemek.
    return this.clubsService.findOne(slug, userId ? parseInt(userId) : undefined);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createClubDto: any) {
    return this.clubsService.createProposal(req.user.id, createClubDto);
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

  @Post(':id/toggle-join')
  @UseGuards(JwtAuthGuard)
  toggleJoin(@Request() req, @Param('id') id: string) {
    return this.clubsService.toggleJoin(req.user.id, parseInt(id));
  }

  @Post(':id/badges')
  @UseGuards(JwtAuthGuard)
  assignBadge(@Request() req, @Param('id') id: string, @Body('badgeId') badgeId: number) {
    return this.clubsService.assignBadge(req.user.id, parseInt(id), badgeId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.clubsService.remove(req.user.id, parseInt(id), req.user.role);
  }

  @Post('seed')
  seed() {
    return this.clubsService.createInitialClubs();
  }
}
