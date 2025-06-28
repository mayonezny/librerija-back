import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { UsersModule } from 'src/users/users.module';
import { MinioController } from './minio.controller';

@Module({
  imports: [UsersModule],
  providers: [MinioService],
  controllers: [MinioController],
  exports: [MinioService],
})
export class MinioModule {}
