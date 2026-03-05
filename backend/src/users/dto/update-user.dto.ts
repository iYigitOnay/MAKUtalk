import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';
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
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPrivate?: boolean;
}
