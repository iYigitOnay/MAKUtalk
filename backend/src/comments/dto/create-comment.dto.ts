import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Yorumun metin içeriği',
    example: 'Harika bir paylaşım, teşekkürler! 🚀',
  })
  @IsString()
  @IsNotEmpty({ message: 'Yorum içeriği boş bırakılamaz.' })
  content: string;
}
