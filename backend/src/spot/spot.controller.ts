import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { SpotService } from './spot.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('spot')
export class SpotController {
  constructor(private readonly spotService: SpotService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/posts',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { url: `http://localhost:3000/uploads/posts/${file.filename}` };
  }

  @Get()
  findAll(@Query('category') category?: string) {
    return this.spotService.findAll(category);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMy(@CurrentUser() user: any) {
    return this.spotService.findMyListings(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.spotService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() data: any) {
    return this.spotService.create(user.id, data);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@CurrentUser() user: any, @Param('id') id: string, @Body('status') status: string) {
    return this.spotService.updateStatus(user.id, +id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.spotService.remove(user.id, +id);
  }
}
