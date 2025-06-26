// src/users/dto/search-users.dto.ts
import { IsOptional, IsString, Length, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchUsersDto {
  @IsOptional()
  @IsString()
  @Length(1, 20)
  search?: string;

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
