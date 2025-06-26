/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// src/users/users.service.ts
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, QueryFailedError } from 'typeorm';
import { User } from '../entities/user.entity';
import { SearchUsersDto } from './dto/search-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async search(dto: SearchUsersDto): Promise<{ data: User[]; total: number }> {
    const { search, page = 1, limit = 20 } = dto;
    const where = search
      ? [
          { username: ILike(`%${search}%`) },
          { email: ILike(`%${search}%`) },
        ]
      : {};
    const [data, total] = await this.userRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { username: 'ASC' },
    });
    return { data, total };
  }

  async findOne(uuid: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { uuid } });
    if (!user) throw new NotFoundException(`User ${uuid} not found`);
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepo.create(dto);
    try {
      return await this.userRepo.save(user);
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
      const driverErr = (error as any).driverError;
      if (driverErr.code === '23505') {
        const detail: string = driverErr.detail || '';
        if (detail.includes('username')) {
          throw new ConflictException('Username already taken');
        }
        if (detail.includes('email')) {
          throw new ConflictException('Email already registered');
        }
        throw new ConflictException('Duplicate field value');
      }
    }
      throw new InternalServerErrorException();
    }
  }

  async update(uuid: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(uuid);
    Object.assign(user, dto);
    try {
      return await this.userRepo.save(user);
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
      const driverErr = (error as any).driverError;
      if (driverErr.code === '23505') {
        const detail: string = driverErr.detail || '';
        if (detail.includes('username')) {
          throw new ConflictException('Username already taken');
        }
        if (detail.includes('email')) {
          throw new ConflictException('Email already registered');
        }
        throw new ConflictException('Duplicate field value');
      }
    }
      throw new InternalServerErrorException();
    }
  }

  async delete(uuid: string): Promise<void> {
    const result = await this.userRepo.delete({ uuid });
    if (result.affected === 0) {
      throw new NotFoundException(`User ${uuid} not found`);
    }
  }

}
