// src/favorites/favorites.service.ts
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';
import { SearchFavoritesDto } from './dto/search-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favRepo: Repository<Favorite>,
  ) {}

  private isUniqueViolation(error: unknown): error is QueryFailedError {
    return (
      error instanceof QueryFailedError &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (error as any).driverError?.code === '23505'
    );
  }

  async findOne(uuid: string): Promise<Favorite> {
    const fav = await this.favRepo.findOne({
      where: { uuid },
      relations: ['user', 'publication'],
    });
    if (!fav) {
      throw new NotFoundException(`Favorite ${uuid} not found`);
    }
    return fav;
  }

  /** Получить список избранного для конкретного пользователя */
  async findByUser(dto: SearchFavoritesDto): Promise<{ data: Favorite[]; total: number }> {
    const { userUuid, page = 1, limit = 20 } = dto;
    const [data, total] = await this.favRepo.findAndCount({
      where: { user: { uuid: userUuid } },
      relations: ['publication'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  /** Получить список пользователей, добавивших заданную публикацию в избранное */
  async findByPublication(dto: SearchFavoritesDto): Promise<{ data: Favorite[]; total: number }> {
    const { publicationUuid, page = 1, limit = 20 } = dto;
    const [data, total] = await this.favRepo.findAndCount({
      where: { publication: { uuid: publicationUuid } },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  /** Добавить в избранное */
  async create(userUuid: string, publicationUuid: string): Promise<Favorite> {
    try {
      const fav = this.favRepo.create({
        user: { uuid: userUuid },
        publication: { uuid: publicationUuid },
      });
      return await this.favRepo.save(fav);
    } catch (err: unknown) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('Already in favorites');
      }
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  /** Удалить из избранного */
  async remove(uuid: string): Promise<void> {
    const result = await this.favRepo.delete({ uuid });
    if (result.affected === 0) {
      throw new NotFoundException(`Favorite ${uuid} not found`);
    }
  }
}
