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

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1];
      if (!token) return client.disconnect();

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      
      // Kullanıcıyı kendi özel odasına al (Örn: "user_5")
      const userRoom = `user_${client.data.userId}`;
      await client.join(userRoom);
      this.logger.log(`Client connected: ${client.id} to room ${userRoom}`);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Mesaj gönderme olayı
  @SubscribeMessage('send_message')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      const senderId = client.data.userId;
      if (!senderId) throw new Error("Socket data içinde userId bulunamadı!");

      this.logger.log(`📩 Mesaj Geldi -> Gönderen: ${senderId}, Alıcı: ${data.receiverId}, İçerik: ${data.content.substring(0, 20)}...`);
      
      // 1. Veritabanına kaydet
      const message = await this.chatService.sendMessage(
        senderId,
        data.conversationId,
        data.content,
      );

      // 2. Mesajı gönderene onayla
      client.emit('new_message', message);

      // 3. Alıcıya gerçek zamanlı ilet
      const receiverRoom = `user_${data.receiverId}`;
      this.server.to(receiverRoom).emit('new_message', message);
      
      this.logger.log(`📤 Mesaj iletildi: ${receiverRoom}`);

      return message;
    } catch (error) {
      this.logger.error(`❌ Mesaj Gönderme Hatası: ${error.message}`);
      client.emit('error', { message: 'Mesaj gönderilemedi.' });
    }
  }

  // Yazıyor... durumunu ilet
  @SubscribeMessage('typing')
  @UsePipes(new ValidationPipe())
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingDto,
  ) {
    this.server.to(`user_${data.receiverId}`).emit('user_typing', {
      conversationId: data.conversationId,
      senderId: client.data.userId,
      isTyping: data.isTyping,
    });
  }
}
