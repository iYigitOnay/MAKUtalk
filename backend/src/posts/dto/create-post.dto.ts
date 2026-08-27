import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Gönderinin metin içeriği',
    example: 'Merhaba MAKUtalk ailesi! Bugün kampüs çok güzel.',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Gönderinin hemen yayınlanıp yayınlanmayacağı',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  published?: boolean;

  @ApiProperty({
    description: 'Gönderinin ait olduğu kategori ID (Snowflake formatında)',
    example: '162631034842779648',
    required: false,
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: 'Eğer bir yanıtsa (reply), üst gönderinin ID bilgisi',
    example: '162631034842779649',
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: 'Gönderinin akademik bir duyuru olup olmadığı',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isAcademic?: boolean;
}
