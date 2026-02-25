import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':userId')
  toggleFollow(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user,
  ) {
    return this.followService.toggleFollow(user.id, userId);
  }

  @Get('followers/:userId')
  getFollowers(@Param('userId', ParseIntPipe) userId: number) {
    return this.followService.getFollowers(userId);
  }

  @Get('following/:userId')
  getFollowing(@Param('userId', ParseIntPipe) userId: number) {
    return this.followService.getFollowing(userId);
  }

  @Get('check/:userId')
  isFollowing(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user,
  ) {
    return this.followService.isFollowing(user.id, userId);
  }
}
