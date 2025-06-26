import { IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchFavoritesDto {
  /** Ищем избранное конкретного пользователя; если опущено — вернёт все записи */
  @IsOptional()
  @IsUUID()
  userUuid?: string;

  /** Или наоборот — кто добавил эту публикацию */
  @IsOptional()
  @IsUUID()
  publicationUuid?: string;

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
