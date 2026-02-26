// src/task-updates/task-update.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('task_updates')
export class TaskUpdate {
  @PrimaryGeneratedColumn()
  id: number;

  // =============================
  // RELATION TO TASK
  // =============================
  @ManyToOne(() => Task, (task) => task.updates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  // =============================
  // RELATION TO USER
  // =============================
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text')
  content: string;

  @Column({ type: 'text', nullable: true })
  evidence_path: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  suggested_status: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
