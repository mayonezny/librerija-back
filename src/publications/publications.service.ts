import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Publication } from '../entities/publication.entity';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { SearchPublicationsDto } from './dto/search-publication.dto';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectRepository(Publication)
    private readonly pubRepo: Repository<Publication>,
  ) {}

  private isUniqueViolation(error: unknown): error is QueryFailedError {
    return (
      error instanceof QueryFailedError &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (error as any).driverError?.code === '23505'
    );
  }

  async findOne(uuid: string): Promise<Publication> {
    const pub = await this.pubRepo.findOne({
      where: { uuid },
      relations: ['type', 'uploader'],
    });
    if (!pub) {
      throw new NotFoundException(`Publication ${uuid} not found`);
    }
    return pub;
  }

  async search(dto: SearchPublicationsDto): Promise<{ data: Publication[]; total: number }> {
    const qb = this.pubRepo
      .createQueryBuilder('pub')
      .leftJoinAndSelect('pub.type', 'type')
      .leftJoinAndSelect('pub.uploader', 'uploader');

    if (dto.name) {
      qb.andWhere('pub.name ILIKE :name', { name: `%${dto.name}%` });
    }
    if (dto.type) {
      qb.andWhere('pub.type = :type', { type: dto.type });
    }
    if (dto.author) {
      qb.andWhere('pub.author ILIKE :author', { author: `%${dto.author}%` });
    }
    if (dto.yearFrom) {
      qb.andWhere('pub.year >= :yearFrom', { yearFrom: dto.yearFrom });
    }
    if (dto.yearTo) {
      qb.andWhere('pub.year <= :yearTo', { yearTo: dto.yearTo });
    }
    if (dto.year) {
      qb.andWhere('pub.year = :year', { year: dto.year });
    }
    if (dto.uploaderUsername) {
      qb.andWhere('uploader.username = :uploaderUsername', {
        uploaderUsername: dto.uploaderUsername,
      });
    }
    if (dto.date) {
      qb.andWhere('pub.createdAt = :date', { date: dto.date });
    }
    if (dto.dateFrom) {
      qb.andWhere('pub.createdAt >= :dateFrom', { dateFrom: dto.dateFrom });
    }
    if (dto.dateTo) {
      qb.andWhere('pub.createdAt <= :dateTo', { dateTo: dto.dateTo });
    }

    if (dto.sortBy) {
      let sortField: string;
      switch (dto.sortBy) {
        case 'name':
          sortField = 'pub.name';
          break;
        case 'author':
          sortField = 'pub.author';
          break;
        case 'uploader':
          sortField = 'uploader.username';
          break;
        case 'year':
          sortField = 'pub.year';
          break;
        case 'createdAt':
          sortField = 'pub.createdAt';
          break;
      }
      const order: 'ASC' | 'DESC' = dto.sortOrder ?? 'ASC';
      qb.orderBy(sortField, order);
    } else {
      // дефолтная сортировка
      qb.orderBy('pub.createdAt', 'DESC');
    }
    // пагинация и сортировка
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async create(dto: CreatePublicationDto, uploaderUuid: string): Promise<Publication> {
    const { type: typeId, ...rest } = dto;
    const pub = this.pubRepo.create({
      ...rest,
      type: { id: typeId },
      // устанавливаем связь через чужой FK
      uploader: { uuid: uploaderUuid },
    });
    try {
      return await this.pubRepo.save(pub);
    } catch (err: unknown) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('Publication already exists');
      } else {
        console.log(err);
      }
      throw new InternalServerErrorException();
    }
  }

  async update(uuid: string, dto: UpdatePublicationDto): Promise<Publication> {
    const pub = await this.findOne(uuid);
    Object.assign(pub, dto);
    try {
      return await this.pubRepo.save(pub);
    } catch (err: unknown) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('Publication already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  async remove(uuid: string): Promise<void> {
    const result = await this.pubRepo.delete({ uuid });
    if (result.affected === 0) {
      throw new NotFoundException(`Publication ${uuid} not found`);
    }
  }
}
