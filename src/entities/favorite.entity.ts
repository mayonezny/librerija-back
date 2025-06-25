/* eslint-disable prettier/prettier */
// src/entities/favorite.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Publication } from './publication.entity';

@Entity('favorites')
@Unique(['user', 'publication'])
export class Favorite {
  
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, user => user.favorites, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  /** FK на публикацию */
  @ManyToOne(() => Publication, pub => pub.favorites, { nullable: false, onDelete: 'CASCADE' })
  publication: Publication;

  /** created_at — автоматически NOW() */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /** updated_at — автоматически NOW() при каждом обновлении */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
