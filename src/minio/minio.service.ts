// src/minio/minio.service.ts
import { ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly client: S3Client;
  readonly bucket = process.env.MINIO_BUCKET;

  constructor(private readonly usersService: UsersService) {
    this.client = new S3Client({
      region: 'us-east-1',
      endpoint: `http://${process.env.MINIO_ENDPOINT}`,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY!,
        secretAccessKey: process.env.MINIO_SECRET_KEY!,
      },
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    try {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    } catch (err: any) {
      // игнорируем, если бакет уже есть
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      if (!/BucketAlreadyOwnedByYou/.test(err.name) && !/BucketAlreadyExists/.test(err.name)) {
        throw err;
      }
    }
  }

  /**
   * file.buffer — через multer интерсептор,
   * userUuid опционально добавляет папку пользователя
   */
  async uploadFile(file: Express.Multer.File, userUuid: string): Promise<string> {
    const username = (await this.usersService.findOne(userUuid)).username;
    const filename = `${Date.now()}_${file.originalname}`;
    const key = `${username}/${filename}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    // Собираем URL: http://{endpoint}/{bucket}/{key}
    const base = `http://${process.env.MINIO_ENDPOINT}`;
    return `${base}/${this.bucket}/${key}`;
  }

  async deleteFile(key: string, uuid: string): Promise<void> {
    const username = (await this.usersService.findOne(uuid)).username;
    // 2) (опционально) проверяем, что у пользователя есть право удалять этот ключ:
    if (!key.startsWith(username + '/')) {
      throw new ForbiddenException('You can only delete your own files');
    }
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
