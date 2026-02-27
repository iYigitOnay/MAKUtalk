import { Controller, Get, Param, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ClubsService } from '../clubs/clubs.service';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Konuşma listesini getir
  @Get('conversations')
  getConversations(@CurrentUser() user: any) {
    return this.chatService.getUserConversations(user.id);
  }

  // İki kişi arasındaki konuşmayı getir veya oluştur
  @Get('conversation/:targetUserId')
  getConversation(@CurrentUser() user: any, @Param('targetUserId') targetUserId: string) {
    return this.chatService.getOrCreateConversation(user.id, +targetUserId);
  }

  // Mesaj geçmişini getir (FIXED: Service method called correctly)
  @Get('messages/:conversationId')
  getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(+conversationId);
  }

  // Mesajları okundu olarak işaretle
  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.chatService.markAsRead(user.id, +id);
  }

  // Sohbeti sil
  @Post('delete/:conversationId')
  async deleteConversation(@CurrentUser() user: any, @Param('conversationId') conversationId: string) {
    return this.chatService.deleteConversation(user.id, +conversationId);
  }

  // Sohbet rengini güncelle
  @Post('theme/:conversationId')
  async updateThemeColor(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
    @Body('color') color: string
  ) {
    return this.chatService.updateThemeColor(user.id, +conversationId, color);
  }
}
