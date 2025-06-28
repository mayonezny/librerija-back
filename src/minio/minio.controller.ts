// src/files/files.controller.ts
import {
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  BadRequestException,
  Body,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { MinioService } from '../minio/minio.service';

interface RequestWithUser extends FastifyRequest {
  user: { uuid: string };
}

@Controller('files')
export class MinioController {
  constructor(private readonly minio: MinioService) {}

  @UseGuards(JwtAccessGuard)
  @Post('upload')
  @HttpCode(201)
  async upload(@Req() req: RequestWithUser, @Res({ passthrough: true }) reply: FastifyReply) {
    // 1) Получаем single файл через fastify-multipart
    const part: MultipartFile = (await req.file()) as MultipartFile;
    if (!part) {
      return reply.status(400).send({ message: 'No file provided' });
    }

    // 2) Читаем весь stream в Buffer
    const chunks: Buffer[] = [];
    for await (const chunk of part.file) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // 3) Собираем "Multer-like" объект для сервиса
    const multerFile: Express.Multer.File = {
      fieldname: part.fieldname,
      originalname: part.filename,
      encoding: part.encoding,
      mimetype: part.mimetype,
      buffer,
      size: buffer.length,
      destination: '',
      filename: part.filename,
      path: '',
      stream: part.file,
    };

    // 4) Отправляем в MinIO
    const url = await this.minio.uploadFile(multerFile, req.user.uuid);

    return { url };
  }

  @UseGuards(JwtAccessGuard)
  @Delete()
  @HttpCode(204)
  async delete(@Req() req: RequestWithUser, @Body() dto: { url: string }) {
    // 1) Разбираем URL и извлекаем ключ внутри бакета:
    //    base = http://{MINIO_ENDPOINT}, bucket = this.bucket
    const base = `http://{MINIO_ENDPOINT}/${this.minio.bucket}/`;
    if (!dto.url.startsWith(base)) {
      throw new BadRequestException('URL does not belong to this bucket');
    }
    const key = dto.url.slice(base.length);
    // 3) Удаляем:
    try {
      await this.minio.deleteFile(key, req.user.uuid);
    } catch (err: unknown) {
      throw new ForbiddenException(err);
    }
  }
}
