import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getUserNotifications(@CurrentUser() user) {
    return this.notificationsService.getUserNotifications(user.id);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('mark-all-read')
  markAllAsRead(@CurrentUser() user) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user,
  ) {
    return this.notificationsService.deleteNotification(id, user.id);
  }
}
