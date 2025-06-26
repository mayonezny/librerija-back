import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Publication } from './publication.entity';

@Entity('favorites')
@Unique(['user', 'publication'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, (user) => user.favorites, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;
  @JoinColumn({ name: 'user_uuid' })

  /** FK на публикацию */
  @ManyToOne(() => Publication, (pub) => pub.favorites, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  publication: Publication;
  @JoinColumn({ name: 'user_uuid' })

  /** created_at — автоматически NOW() */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /** updated_at — автоматически NOW() при каждом обновлении */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
