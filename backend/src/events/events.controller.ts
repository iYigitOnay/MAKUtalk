import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(req.user.id, createEventDto);
  }

  @Get()
  findAll(@Query('currentUserId') currentUserId?: string) {
    return this.eventsService.findAll(currentUserId ? parseInt(currentUserId) : undefined);
  }

  @Post(':id/attend')
  @UseGuards(JwtAuthGuard)
  toggleAttendance(@Request() req, @Param('id') id: string) {
    return this.eventsService.toggleAttendance(req.user.id, parseInt(id));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.eventsService.remove(req.user.id, parseInt(id));
  }
}
