import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Yorum içeriği boş bırakılamaz.' })
  content: string;
}
