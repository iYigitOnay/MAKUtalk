import {
  Controller,
  Post,
  Param,
  UseGuards,
  Get,
  Delete,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  async toggleFollow(@Param('id') followingId: string, @CurrentUser() user) {
    return this.followService.toggleFollow(BigInt(user.id), BigInt(followingId));
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  async getPendingRequests(@CurrentUser() user) {
    return this.followService.getPendingRequests(BigInt(user.id));
  }

  @Post('requests/:id/accept')
  @UseGuards(JwtAuthGuard)
  async acceptRequest(@Param('id') requestId: string, @CurrentUser() user) {
    return this.followService.acceptRequest(BigInt(user.id), BigInt(requestId));
  }

  @Delete('requests/:id/reject')
  @UseGuards(JwtAuthGuard)
  async rejectRequest(@Param('id') requestId: string, @CurrentUser() user) {
    return this.followService.rejectRequest(BigInt(user.id), BigInt(requestId));
  }

  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string) {
    return this.followService.getFollowers(BigInt(userId));
  }

  @Get('following/:userId')
  async getFollowing(@Param('userId') userId: string) {
    return this.followService.getFollowing(BigInt(userId));
  }

  @Get('status/:userId')
  @UseGuards(JwtAuthGuard)
  async getFollowStatus(@Param('userId') userId: string, @CurrentUser() user) {
    return this.followService.isFollowing(BigInt(user.id), BigInt(userId));
  }
}
