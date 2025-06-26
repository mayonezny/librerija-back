// src/entities/publication.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { PublicationType } from './publication-type.entity';
import { Favorite } from './favorite.entity';

@Entity('publications')
@Unique(['name', 'author', 'year'])
export class Publication {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  // внешний ключ на таблицу типов публикаций
  @ManyToOne(() => PublicationType, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'type' })
  type: PublicationType;

  @Column({ type: 'varchar', length: 100 })
  author: string;

  @Column({ type: 'date', nullable: true })
  year?: Date;
  // автор (FK на пользователей)
  @ManyToOne(() => User, (user) => user.publications, {
    nullable: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'uploader_uuid' })
  uploader: User;

  @Column({ type: 'varchar', length: 500 })
  file: string;

  @Column({ name: 'file_format', type: 'varchar', length: 50, nullable: true })
  fileFormat?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Favorite, (fav) => fav.publication)
  favorites: Favorite[];
}
