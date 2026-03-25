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
  private static onlineUsers = new Set<string>(); // BigInt'leri string olarak tutmak Set karşılaştırması için daha güvenlidir.

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  static getOnlineCount(): number {
    return this.onlineUsers.size;
  }

  static isUserOnline(userId: bigint | string): boolean {
    return this.onlineUsers.has(userId.toString());
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1];
      if (!token) return client.disconnect();

      const payload = this.jwtService.verify(token);
      const userId = BigInt(payload.sub);
      client.data.userId = userId;

      ChatGateway.onlineUsers.add(userId.toString());

      const userRoom = `user_${userId.toString()}`;
      await client.join(userRoom);
      this.logger.log(
        `Client connected: ${client.id} (User: ${userId.toString()})`,
      );

      client.emit('online_users', Array.from(ChatGateway.onlineUsers));
      this.server.emit('user_status', {
        userId: userId.toString(),
        isOnline: true,
      });
      this.server.emit('online_count', ChatGateway.onlineUsers.size);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      ChatGateway.onlineUsers.delete(userId.toString());
      this.server.emit('user_status', {
        userId: userId.toString(),
        isOnline: false,
      });
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
      if (!senderId) throw new Error('Yetkisiz erişim!');

      const conversationId = BigInt(data.conversationId);

      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: true },
      });

      if (!conversation) throw new Error('Sohbet bulunamadı.');
      const isParticipant = conversation.participants.some(
        (p) => p.userId === senderId,
      );
      if (!isParticipant)
        throw new Error('Bu sohbete mesaj gönderme yetkiniz yok.');

      const actualReceiver = conversation.participants.find(
        (p) => p.userId !== senderId,
      );
      if (!actualReceiver) throw new Error('Alıcı bulunamadı.');

      const message = await this.chatService.sendMessage(
        senderId,
        conversationId,
        data.content,
        data.postId ? BigInt(data.postId) : undefined,
        data.isForwarded || false,
        data.mediaUrl,
        data.mediaType,
      );

      client.emit('new_message', message);

      const receiverRoom = `user_${actualReceiver.userId.toString()}`;
      this.server.to(receiverRoom).emit('new_message', message);

      this.logger.log(
        `📤 Mesaj iletildi: ${senderId.toString()} -> ${actualReceiver.userId.toString()}`,
      );

      return message;
    } catch (error) {
      this.logger.error(`❌ Mesaj Gönderme Hatası: ${error.message}`);
      client.emit('error', {
        message: 'Mesaj gönderilemedi: ' + error.message,
      });
    }
  }

  @SubscribeMessage('typing')
  @UsePipes(new ValidationPipe())
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingDto,
  ) {
    const senderId = client.data.userId;
    const conversationId = BigInt(data.conversationId);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: { select: { userId: true } } },
    });

    if (
      conversation &&
      conversation.participants.some((p) => p.userId === senderId)
    ) {
      const receiver = conversation.participants.find(
        (p) => p.userId !== senderId,
      );
      if (receiver) {
        this.server
          .to(`user_${receiver.userId.toString()}`)
          .emit('user_typing', {
            conversationId: data.conversationId.toString(),
            senderId: senderId.toString(),
            isTyping: data.isTyping,
          });
      }
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string | number },
  ) {
    const userId = client.data.userId;
    if (!userId || !data.conversationId) return;

    const conversationId = BigInt(data.conversationId);

    await this.prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: { select: { userId: true } } },
    });

    if (!conversation) return;

    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== userId,
    );
    if (!otherParticipant) return;

    const senderRoom = `user_${otherParticipant.userId.toString()}`;
    this.server.to(senderRoom).emit('messages_read', {
      conversationId: conversationId.toString(),
      readByUserId: userId.toString(),
    });

    this.logger.log(
      `👁️ [READ_EVENT] User ${userId.toString()} read Conv ${conversationId.toString()}. Notifying Sender ${otherParticipant.userId.toString()}`,
    );
  }

  broadcastMessagesRead(
    conversationId: bigint,
    readByUserId: bigint,
    receiverUserId: bigint,
  ) {
    this.server.to(`user_${receiverUserId.toString()}`).emit('messages_read', {
      conversationId: conversationId.toString(),
      readByUserId: readByUserId.toString(),
    });
  }

  private convertBigIntToString(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (Array.isArray(obj))
      return obj.map((item) => this.convertBigIntToString(item));
    if (typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = this.convertBigIntToString(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  }

  broadcastNewPost(post: any) {
    const serializedPost = this.convertBigIntToString(post);
    this.server.emit('new_post', serializedPost);
  }
}
