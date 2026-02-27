import { IsString, IsNumber, IsNotEmpty, IsBoolean } from 'class-validator';

export class SendMessageDto {
  @IsNumber()
  @IsNotEmpty()
  conversationId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsNotEmpty()
  receiverId: number;
}

export class TypingDto {
  @IsNumber()
  @IsNotEmpty()
  conversationId: number;

  @IsNumber()
  @IsNotEmpty()
  receiverId: number;

  @IsBoolean()
  @IsNotEmpty()
  isTyping: boolean;
}
