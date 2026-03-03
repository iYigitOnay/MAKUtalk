import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsInt } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  campus?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  @IsOptional()
  clubId?: number;
}
