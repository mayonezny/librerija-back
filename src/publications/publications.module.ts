import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publication } from '../entities/publication.entity';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Publication])],
  providers: [PublicationsService],
  controllers: [PublicationsController],
})
export class PublicationsModule {}
