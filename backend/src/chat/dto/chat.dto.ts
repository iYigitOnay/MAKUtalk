import { IsString, IsNumber, IsNotEmpty, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsNumber()
  @IsNotEmpty()
  conversationId: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Mesaj en fazla 1000 karakter olabilir.' })
  content?: string;

  @IsNumber()
  @IsNotEmpty()
  receiverId: number;

  @IsNumber()
  @IsOptional()
  postId?: number;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsString()
  @IsOptional()
  mediaType?: string;

  @IsBoolean()
  @IsOptional()
  isForwarded?: boolean;
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
