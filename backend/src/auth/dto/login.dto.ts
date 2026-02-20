import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Parola boş bırakılamaz.' })
  password: string;
}
