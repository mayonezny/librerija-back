// src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// Подтягивает все поля CreateUserDto и делает их опциональными
export class UpdateUserDto extends PartialType(CreateUserDto) {}
