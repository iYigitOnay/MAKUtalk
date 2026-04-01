import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Kullanıcının e-posta adresi veya öğrenci numarası',
    example: '2111001001@ogr.mehmetakif.edu.tr',
  })
  @IsString()
  @IsNotEmpty({ message: 'E-posta veya öğrenci numarası boş bırakılamaz.' })
  email: string;

  @ApiProperty({
    description: 'Kullanıcının parolası',
    example: 'maku123456',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty({ message: 'Parola boş bırakılamaz.' })
  password: string;
}
