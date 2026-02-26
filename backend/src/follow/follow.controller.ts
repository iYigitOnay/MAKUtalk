import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
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
    @CurrentUser() user,
    @Param('userId', ParseIntPipe) followingId: number,
  ) {
    return this.followService.toggleFollow(user.id, followingId);
  }

  @Get('requests')
  getPendingRequests(@CurrentUser() user) {
    return this.followService.getPendingRequests(user.id);
  }

  @Post('requests/:id/accept')
  acceptRequest(
    @CurrentUser() user,
    @Param('id', ParseIntPipe) requestId: number,
  ) {
    return this.followService.acceptRequest(user.id, requestId);
  }

  @Post('requests/:id/reject')
  rejectRequest(
    @CurrentUser() user,
    @Param('id', ParseIntPipe) requestId: number,
  ) {
    return this.followService.rejectRequest(user.id, requestId);
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
    @CurrentUser() user,
    @Param('userId', ParseIntPipe) followingId: number,
  ) {
    return this.followService.isFollowing(user.id, followingId);
  }
}
