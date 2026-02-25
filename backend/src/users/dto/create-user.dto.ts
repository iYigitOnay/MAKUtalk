import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'MAKÜ e-posta adresinizi giriniz.' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Kullanıcı adınız en az 3 karakter olmalıdır.' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Parolanız en az 6 karakter olmalıdır.' })
  password: string;

  @IsString()
  @IsOptional()
  fullName?: string;
}
