import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Delete,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Comments (Yorumlar)')
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bir gönderiye yorum yapar' })
  @ApiResponse({ status: 201, description: 'Yorum başarıyla oluşturuldu.' })
  create(
    @Param('postId') postId: string,
    @CurrentUser() user,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(BigInt(user.id), BigInt(postId), createCommentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Bir gönderinin tüm yorumlarını listeler' })
  findByPost(
    @Param('postId') postId: string,
    @CurrentUser() user?: any
  ) {
    return this.commentsService.findByPost(BigInt(postId), user ? BigInt(user.id) : undefined);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bir yorumu siler' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.commentsService.remove(BigInt(id), BigInt(user.id));
  }
}
