import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { config } from 'dotenv';
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +!process.env.DB_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [path.join(__dirname, 'src/**/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'src/migrations/*.{ts,js}')],
  synchronize: Boolean(process.env.TYPEORM_SYNCHRONIZE),
});
