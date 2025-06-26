// src/publications/dto/search-publications.dto.ts
import { IsOptional, IsString, Length, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPublicationsDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  search?: string; // будет искать по названию или автору

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
