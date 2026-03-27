import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Query,
  BadRequestException,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService,
  ) {}

  @Delete('message/:id')
  async deleteMessage(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.chatService.removeMessage(BigInt(id), BigInt(user.id));
  }

  @Get('conversations')
  getConversations(@CurrentUser() user: any) {
    return this.chatService.getUserConversations(BigInt(user.id));
  }

  @Get('conversation/:targetUserId')
  async getConversation(
    @CurrentUser() user: any,
    @Param('targetUserId') targetUserId: string,
    @Query('fromSpot') fromSpot?: string,
    @Query('listingId') listingId?: string,
  ) {
    let isFromSpot = fromSpot === 'true';

    if (isFromSpot && listingId) {
      const listing = await this.prisma.spotListing.findUnique({
        where: { id: BigInt(listingId) },
      });
      if (!listing) throw new BadRequestException('Geçersiz ilan referansı.');
      if (listing.authorId !== BigInt(targetUserId))
        throw new BadRequestException('Bu ilan bu kullanıcıya ait değil.');
    } else if (isFromSpot && !listingId) {
      isFromSpot = false;
    }
    return this.chatService.getOrCreateConversation(
      BigInt(user.id),
      BigInt(targetUserId),
    );
  }

  @Get('messages/:conversationId')
  getMessages(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.getMessages(
      BigInt(conversationId),
      BigInt(user.id),
    );
  }

  @Post(':id/read')
  markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.chatService.markMessagesAsRead(BigInt(id), BigInt(user.id));
  }

  @Post('delete/:conversationId')
  async deleteConversation(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.removeConversation(
      BigInt(user.id),
      BigInt(conversationId),
    );
  }

  @Post('theme/:conversationId')
  async updateThemeColor(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
    @Body('color') color: string,
  ) {
    return this.chatService.updateThemeColor(
      BigInt(user.id),
      BigInt(conversationId),
      color,
    );
  }

  @Post('accept/:conversationId')
  acceptRequest(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.acceptRequest(
      BigInt(user.id),
      BigInt(conversationId),
    );
  }

  @Post('reject/:conversationId')
  rejectRequest(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.rejectRequest(
      BigInt(user.id),
      BigInt(conversationId),
    );
  }
}
