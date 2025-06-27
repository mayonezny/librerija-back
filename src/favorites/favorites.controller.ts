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
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { SearchFavoritesDto } from './dto/search-favorite.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { RequestWithUser } from 'src/auth/auth.interfaces';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favService: FavoritesService) {}

  @UseGuards(JwtAccessGuard)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.favService.findOne(id);
  }
  @UseGuards(JwtAccessGuard)
  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateFavoriteDto, @Req() req: RequestWithUser) {
    const uploaderUuid = req.user.uuid; // req.user.uuid зависит от вашего AuthGuard //мок пока нет аутентификации
    return this.favService.create(uploaderUuid, dto.publicationUuid);
  }

  @UseGuards(JwtAccessGuard)
  @Post('search/user')
  @HttpCode(201)
  searchByUser(@Body() dto: SearchFavoritesDto) {
    return this.favService.findByUser(dto);
  }

  @UseGuards(JwtAccessGuard)
  @Post('search/publication')
  @HttpCode(201)
  searchByPublication(@Body() dto: SearchFavoritesDto) {
    return this.favService.findByPublication(dto);
  }

  @UseGuards(JwtAccessGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.favService.remove(id);
  }
}
