import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['SECRETARY', 'UNIT'], default: 'UNIT' })
  role: string;

  @Column({ nullable: true })
  avatar_seed: string;

  @Column({ nullable: true })
  division: string;

  @CreateDateColumn()
  created_at: Date;
}
