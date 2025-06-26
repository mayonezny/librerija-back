import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsInt,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePublicationDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 50)
  author: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-2000)
  @Max(new Date().getFullYear())
  year?: number;

  @IsString()
  @IsNotEmpty()
  @Length(15, 500)
  file: string; // URL или путь в хранилище

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  type: number; // ID из таблицы publication_types
}
