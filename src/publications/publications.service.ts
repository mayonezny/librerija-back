import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, ILike } from 'typeorm';
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

  async search(
    dto: SearchPublicationsDto,
  ): Promise<{ data: Publication[]; total: number }> {
    const { search, page = 1, limit = 20 } = dto;

    // Строим условие: ищем по name или author
    const where = search
      ? [{ name: ILike(`%${search}%`) }, { author: ILike(`%${search}%`) }]
      : {};

    const [data, total] = await this.pubRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async create(
    dto: CreatePublicationDto,
    uploaderUuid: string,
  ): Promise<Publication> {
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
