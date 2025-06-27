// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUsersDto } from './dto/search-user.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/:id
  @UseGuards(JwtAccessGuard)
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findOne(id);
  }

  // POST /users/search
  @UseGuards(JwtAccessGuard)
  @Post('search')
  async search(@Body() dto: SearchUsersDto) {
    return this.usersService.search(dto);
  }

  // POST /users
  // @Post()
  // @HttpCode(201)
  // async create(@Body() dto: CreateUserDto) {
  //   return this.usersService.create(dto);
  // }

  // PATCH /users/:id
  @UseGuards(JwtAccessGuard)
  @Patch(':id')
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // DELETE /users/:id
  @UseGuards(JwtAccessGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.usersService.delete(id);
  }
}
