import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile, UnauthorizedException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/events',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `event-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  create(@Request() req, @Body() createEventDto: CreateEventDto, @UploadedFile() file?: Express.Multer.File) {
    if (file) {
      createEventDto.imageUrl = `/uploads/events/${file.filename}`;
    }
    return this.eventsService.create(req.user.id, createEventDto);
  }

  @Post('sync-manual')
  @UseGuards(JwtAuthGuard)
  syncManual(@Request() req) {
    const isAdmin = req.user.role === 'ADMIN' || req.user.email === '2312101063@ogr.mehmetakif.edu.tr';
    if (!isAdmin) throw new UnauthorizedException('Yetkiniz yok.');
    return this.eventsService.scrapeUniversityEvents();
  }

  @Get()
  findAll(@Query('currentUserId') currentUserId?: string) {
    return this.eventsService.findAll(currentUserId ? BigInt(currentUserId) : undefined);
  }

  @Post(':id/attend')
  @UseGuards(JwtAuthGuard)
  toggleAttendance(@Request() req, @Param('id') id: string) {
    return this.eventsService.toggleAttendance(req.user.id, BigInt(id));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.eventsService.remove(req.user.id, BigInt(id));
  }
}
