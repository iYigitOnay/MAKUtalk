import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { SendMessageDto, TypingDto } from './dto/chat.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private static onlineUsers = new Set<number>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  static getOnlineCount(): number {
    return this.onlineUsers.size;
  }

  static isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1];
      if (!token) return client.disconnect();

      const payload = this.jwtService.verify(token);
      const userId = Number(payload.sub);
      client.data.userId = userId;
      
      ChatGateway.onlineUsers.add(userId);
      
      const userRoom = `user_${userId}`;
      await client.join(userRoom);
      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
      
      // Bağlanan kullanıcıya mevcut çevrim içi kullanıcıları gönder
      client.emit('online_users', Array.from(ChatGateway.onlineUsers));

      // Herkese bu kullanıcının çevrim içi olduğunu bildir
      this.server.emit('user_status', { userId, isOnline: true });
      
      this.server.emit('online_count', ChatGateway.onlineUsers.size);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      ChatGateway.onlineUsers.delete(userId);
      this.server.emit('user_status', { userId, isOnline: false });
      this.server.emit('online_count', ChatGateway.onlineUsers.size);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('send_message')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      const senderId = client.data.userId;
      if (!senderId) throw new Error("Yetkisiz erişim!");

      const conversation = await this.prisma.conversation.findUnique({
        where: { id: data.conversationId },
        include: { participants: true }
      });

      if (!conversation) throw new Error("Sohbet bulunamadı.");
      const isParticipant = conversation.participants.some(p => p.userId == senderId);
      if (!isParticipant) throw new Error("Bu sohbete mesaj gönderme yetkiniz yok.");

      const actualReceiver = conversation.participants.find(p => p.userId != senderId);
      if (!actualReceiver) throw new Error("Alıcı bulunamadı.");

      const message = await this.chatService.sendMessage(
        senderId,
        data.conversationId,
        data.content,
        data.postId,
        data.isForwarded || false
      );

      client.emit('new_message', message);

      const receiverRoom = `user_${actualReceiver.userId}`;
      this.server.to(receiverRoom).emit('new_message', message);
      
      this.logger.log(`📤 Mesaj iletildi: ${senderId} -> ${actualReceiver.userId}`);

      return message;
    } catch (error) {
      this.logger.error(`❌ Mesaj Gönderme Hatası: ${error.message}`);
      client.emit('error', { message: 'Mesaj gönderilemedi: ' + error.message });
    }
  }

  @SubscribeMessage('typing')
  @UsePipes(new ValidationPipe())
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingDto,
  ) {
    const senderId = client.data.userId;
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: data.conversationId },
      include: { participants: { select: { userId: true } } }
    });

    if (conversation && conversation.participants.some(p => p.userId === senderId)) {
      const receiver = conversation.participants.find(p => p.userId !== senderId);
      if (receiver) {
        this.server.to(`user_${receiver.userId}`).emit('user_typing', {
          conversationId: data.conversationId,
          senderId: senderId,
          isTyping: data.isTyping,
        });
      }
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    const userId = client.data.userId;
    if (!userId || !data.conversationId) return;

    await this.prisma.message.updateMany({
      where: {
        conversationId: data.conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: data.conversationId },
      include: { participants: { select: { userId: true } } },
    });

    if (!conversation) return;

    const otherParticipant = conversation.participants.find(p => p.userId !== userId);
    if (!otherParticipant) return;

    const senderRoom = `user_${otherParticipant.userId}`;
    this.server.to(senderRoom).emit('messages_read', {
      conversationId: data.conversationId,
      readByUserId: userId,
    });

    this.logger.log(`👁️ [READ_EVENT] User ${userId} read Conv ${data.conversationId}. Notifying Sender ${otherParticipant.userId}`);
  }

  broadcastMessagesRead(conversationId: number, readByUserId: number, receiverUserId: number) {
    this.server.to(`user_${receiverUserId}`).emit('messages_read', {
      conversationId,
      readByUserId,
    });
  }

  broadcastNewPost(post: any) {
    this.server.emit('new_post', post);
  }
}
