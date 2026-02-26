// src/task-updates/task-update.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('task_updates')
export class TaskUpdate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  task_id: number;

  @Column()
  user_id: number;

  @Column('text')
  content: string;

  @Column({ type: 'text', nullable: true })
  evidence_path: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  suggested_status: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
