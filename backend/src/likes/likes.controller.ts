import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('post/:postId')
  likePost(@Param('postId', ParseIntPipe) postId: number, @CurrentUser() user) {
    return this.likesService.likePost(user.id, postId);
  }

  @Get('post/:postId')
  getPostLikes(@Param('postId', ParseIntPipe) postId: number) {
    return this.likesService.getPostLikes(postId);
  }

  @Get('post/:postId/check')
  isLikedByUser(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user,
  ) {
    return this.likesService.isLikedByUser(user.id, postId);
  }
}
