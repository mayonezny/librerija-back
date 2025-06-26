import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('publication_types')
@Unique(['name'])
export class PublicationType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
