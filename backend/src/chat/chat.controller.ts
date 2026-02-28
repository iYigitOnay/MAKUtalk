import { Controller, Get, Param, Post, Body, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService
  ) {}

  @Get('conversations')
  getConversations(@CurrentUser() user: any) {
    return this.chatService.getUserConversations(user.id);
  }

  @Get('conversation/:targetUserId')
  async getConversation(
    @CurrentUser() user: any, 
    @Param('targetUserId') targetUserId: string, 
    @Query('fromSpot') fromSpot?: string,
    @Query('listingId') listingId?: string
  ) {
    let isFromSpot = fromSpot === 'true';

    // SPOT BYPASS KORUMASI: Eğer fromSpot true ise, gerçekten bir ilan var mı kontrol et!
    if (isFromSpot && listingId) {
      const listing = await this.prisma.spotListing.findUnique({ where: { id: +listingId } });
      if (!listing) {
        throw new BadRequestException('Geçersiz ilan referansı.');
      }
      // Opsiyonel: İlanın sahibinin targetUserId olup olmadığı da kontrol edilebilir
      if (listing.authorId !== +targetUserId) {
        throw new BadRequestException('Bu ilan bu kullanıcıya ait değil.');
      }
    } else if (isFromSpot && !listingId) {
       // listingId yoksa ama fromSpot true ise şüpheli durum, normal gizlilik kurallarını uygula
       isFromSpot = false;
    }

    return this.chatService.getOrCreateConversation(user.id, +targetUserId, isFromSpot);
  }

  @Get('messages/:conversationId')
  getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(+conversationId);
  }

  @Post(':id/read')
  markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.chatService.markAsRead(user.id, +id);
  }

  @Post('delete/:conversationId')
  async deleteConversation(@CurrentUser() user: any, @Param('conversationId') conversationId: string) {
    return this.chatService.deleteConversation(user.id, +conversationId);
  }

  @Post('theme/:conversationId')
  async updateThemeColor(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
    @Body('color') color: string
  ) {
    return this.chatService.updateThemeColor(user.id, +conversationId, color);
  }

  @Post('accept/:conversationId')
  acceptRequest(@CurrentUser() user: any, @Param('conversationId') conversationId: string) {
    return this.chatService.acceptRequest(user.id, +conversationId);
  }

  @Post('reject/:conversationId')
  rejectRequest(@CurrentUser() user: any, @Param('conversationId') conversationId: string) {
    return this.chatService.rejectRequest(user.id, +conversationId);
  }
}
