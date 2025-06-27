// src/publications/dto/search-publications.dto.ts
import {
  IsOptional,
  IsString,
  Length,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsDateString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
type sortTypes = 'name' | 'author' | 'uploader' | 'year' | 'createdAt';
export class SearchPublicationsDto {
  @IsOptional()
  @IsIn(['name', 'author', 'uploader', 'year', 'createdAt'] as const)
  sortBy?: sortTypes;

  @IsOptional()
  @IsIn(['ASC', 'DESC'] as const)
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  type?: number;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  author?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-2000)
  @Max(new Date().getFullYear())
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-2000)
  @Max(new Date().getFullYear())
  yearFrom?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-2000)
  @Max(new Date().getFullYear())
  yearTo?: number;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  uploaderUsername?: string;

  @IsOptional()
  @IsDateString()
  date?: string; // формат YYYY-MM-DD или ISO

  @IsOptional()
  @IsDateString()
  dateFrom?: string; // формат YYYY-MM-DD или ISO

  @IsOptional()
  @IsDateString()
  dateTo?: string;

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
