import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsDateString,
  IsUrl,
  IsInt,
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
  @IsDateString()
  year?: string; // хранит дату в формате YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @Length(5, 500)
  file: string; // URL или путь в хранилище

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  type: number; // ID из таблицы publication_types
}
