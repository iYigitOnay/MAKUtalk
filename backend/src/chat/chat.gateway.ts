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
      const userId = payload.sub;
      client.data.userId = userId;
      
      ChatGateway.onlineUsers.add(userId);
      
      const userRoom = `user_${userId}`;
      await client.join(userRoom);
      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
      
      // Adminlere yeni birinin geldiğini haber ver (opsiyonel)
      this.server.emit('online_count', ChatGateway.onlineUsers.size);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      ChatGateway.onlineUsers.delete(userId);
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

      // 1. DOĞRULAMA (Audit Log önerisiyle): 
      // Client'ın gönderdiği receiverId'ye GÜVENME. Conversation üzerinden doğrula!
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: data.conversationId },
        include: { participants: true }
      });

      if (!conversation) throw new Error("Sohbet bulunamadı.");
      const isParticipant = conversation.participants.some(p => p.userId === senderId);
      if (!isParticipant) throw new Error("Bu sohbete mesaj gönderme yetkiniz yok.");

      const actualReceiver = conversation.participants.find(p => p.userId !== senderId);
      if (!actualReceiver) throw new Error("Alıcı bulunamadı.");

      // 2. Veritabanına kaydet (Service içinde auth ve transaction kuralları çalışır)
      const message = await this.chatService.sendMessage(
        senderId,
        data.conversationId,
        data.content,
      );

      // 3. Mesajı gönderene onayla
      client.emit('new_message', message);

      // 4. ALICIYA DOĞRULANMIŞ ODA ÜZERİNDEN İLET
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
    // Typing durumu için de katılımcı doğrulaması (Opsiyonel ama önerilen güvenlik)
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
}
