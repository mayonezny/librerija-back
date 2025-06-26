import { IsUUID } from 'class-validator';

export class CreateFavoriteDto {
  @IsUUID()
  publicationUuid: string; // UUID публикации, которую добавляем в избранное
}
