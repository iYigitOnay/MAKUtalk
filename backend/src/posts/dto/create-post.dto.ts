import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: 'İçerik boş bırakılamaz.' })
  content: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsInt()
  @IsOptional()
  categoryId?: number;
}
