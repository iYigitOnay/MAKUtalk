import { Controller, Post, Param, UseGuards, Get } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':postId')
  @UseGuards(JwtAuthGuard)
  async toggleLike(@Param('postId') postId: string, @CurrentUser() user) {
    return this.likesService.likePost(BigInt(user.id), BigInt(postId));
  }

  @Get(':postId')
  async getLikes(@Param('postId') postId: string) {
    return this.likesService.getPostLikes(BigInt(postId));
  }

  @Get(':postId/status')
  @UseGuards(JwtAuthGuard)
  async isLiked(@Param('postId') postId: string, @CurrentUser() user) {
    return this.likesService.isLikedByUser(BigInt(user.id), BigInt(postId));
  }
}
