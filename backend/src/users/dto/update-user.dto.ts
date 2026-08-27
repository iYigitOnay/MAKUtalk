import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  class?: string;

  @IsOptional()
  @Transform(({ value }) => {
    // String "false" veya "true" değerlerini burada manuel yakalıyoruz 
    // NestJS'in otomatik (hatalı) boolean çevrimine girmeden önce müdahale ediyoruz.
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    if (value === undefined || value === null) return undefined;
    return value;
  })
  isPrivate?: any; // Boolean yerine any kullanarak otomatik conversion'ı bypass ediyoruz
}
