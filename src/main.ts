import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { S3Client } from '@aws-sdk/client-s3';
import { ValidationPipe } from '@nestjs/common';
import '@fastify/cookie';
import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  // Создаём приложение на Fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
  );

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET, // опционально: подпись
    parseOptions: {}, // любые опции плагина
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Учебные материалы')
    .setDescription('API для публикации и поиска')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'authorization',
    )
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, doc);

  // MinIO / S3
  const s3Client = new S3Client({
    region: 'us-east-1', // любая, если S3-совместимое
    endpoint: `http://${process.env.MINIO_ENDPOINT}`,
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY!,
      secretAccessKey: process.env.MINIO_SECRET_KEY!,
    },
    forcePathStyle: true,
  });
  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
