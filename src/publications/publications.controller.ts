import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  ParseUUIDPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { SearchPublicationsDto } from './dto/search-publication.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';

@Controller('publications')
export class PublicationsController {
  constructor(private readonly pubsService: PublicationsService) {}

  /** Поиск публикаций */
  @Post('search')
  @HttpCode(201)
  search(@Body() dto: SearchPublicationsDto) {
    return this.pubsService.search(dto);
  }

  /** Создать новую публикацию */
  @UseGuards(JwtAccessGuard)
  @Post()
  @HttpCode(201)
  create(@Body() dto: CreatePublicationDto, @Req() req: any) {
    const uploaderUuid = '49e526e6-830d-45dc-84fc-d7ccbf112e89'; // req.user.uuid зависит от вашего AuthGuard //мок пока нет аутентификации
    return this.pubsService.create(dto, uploaderUuid);
  }

  /** Получить по UUID */
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.pubsService.findOne(id);
  }

  /** Частичное обновление */
  @UseGuards(JwtAccessGuard)
  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdatePublicationDto) {
    return this.pubsService.update(id, dto);
  }

  /** Удалить */
  @UseGuards(JwtAccessGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.pubsService.remove(id);
  }
}
