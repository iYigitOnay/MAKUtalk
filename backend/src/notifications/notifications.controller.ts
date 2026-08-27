import { Controller, Get, Post, Param, UseGuards, Query, Delete, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @CurrentUser() user,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getUserNotifications(
      BigInt(user.id),
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user) {
    return this.notificationsService.getUnreadCount(BigInt(user.id));
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @CurrentUser() user) {
    return this.notificationsService.markAsRead(BigInt(id), BigInt(user.id));
  }

  @Patch('mark-all-read')
  async markAllAsRead(@CurrentUser() user) {
    return this.notificationsService.markAllAsRead(BigInt(user.id));
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @CurrentUser() user) {
    return this.notificationsService.deleteNotification(BigInt(id), BigInt(user.id));
  }
}
