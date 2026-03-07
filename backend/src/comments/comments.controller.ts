import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('post/:postId')
  @UseGuards(JwtAuthGuard)
  @Throttle({ medium: { limit: 5, ttl: 60000 } }) // Dakikada max 5 yorum
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user,
  ) {
    return this.commentsService.create(user.id, postId, createCommentDto);
  }

  @Get('post/:postId')
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.findByPost(postId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.commentsService.remove(id, user.id);
  }
}
