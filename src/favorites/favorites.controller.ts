// src/favorites/favorites.controller.ts
import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Req,
  ParseUUIDPipe,
  HttpCode,
  Body,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { SearchFavoritesDto } from './dto/search-favorite.dto';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favService: FavoritesService) {}

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.favService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateFavoriteDto, @Req() req: any) {
    const uploaderUuid = '5adc3c7a-3940-4105-b5f7-7a439ecfa9f3'; // req.user.uuid зависит от вашего AuthGuard //мок пока нет аутентификации
    return this.favService.create(uploaderUuid, dto.publicationUuid);
  }

  @Post('search/user')
  @HttpCode(201)
  searchByUser(@Body() dto: SearchFavoritesDto) {
    return this.favService.findByUser(dto);
  }

  @Post('search/publication')
  @HttpCode(201)
  searchByPublication(@Body() dto: SearchFavoritesDto) {
    return this.favService.findByPublication(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.favService.remove(id);
  }
}
