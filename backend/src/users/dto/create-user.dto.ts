import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  @Matches(/^[a-zA-Z0-9._%+-]+@(ogr\.)?mehmetakif\.edu\.tr$/, {
    message: 'Sadece @mehmetakif.edu.tr veya @ogr.mehmetakif.edu.tr uzantılı adresler kabul edilmektedir.',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Kullanıcı adınız en az 3 karakter olmalıdır.' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Parolanız en az 8 karakter olmalıdır.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Parolanız en az bir büyük harf, bir küçük harf ve bir özel karakter veya rakam içermelidir.',
  })
  password: string;

  @IsString()
  @IsOptional()
  fullName?: string;
}
