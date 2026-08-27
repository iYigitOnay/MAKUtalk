import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  conversationId: string | number;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Mesaj en fazla 1000 karakter olabilir.' })
  content?: string;

  @IsNotEmpty()
  receiverId: string | number;

  @IsOptional()
  postId?: string | number;

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
  @IsNotEmpty()
  conversationId: string | number;

  @IsNotEmpty()
  receiverId: string | number;

  @IsBoolean()
  @IsNotEmpty()
  isTyping: boolean;
}
