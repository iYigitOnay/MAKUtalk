import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'E-posta veya öğrenci numarası boş bırakılamaz.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Parola boş bırakılamaz.' })
  password: string;
}
