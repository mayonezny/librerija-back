/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Publication } from './publication.entity';
import { Favorite } from './favorite.entity';

@Entity('users')
export class User{

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 256 })
  password: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profilePic?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  picFilename?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Publication, pub => pub.uploader)
  publications: Publication[];

  @OneToMany(() => Favorite, fav => fav.user)
  favorites: Favorite[];
}
