import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
