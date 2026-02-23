import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // =============================
  // ACCOUNTABLE (A)
  // =============================
  @ManyToOne(() => User)
  @JoinColumn({ name: 'accountable_id' })
  primaryAssignee: User;

  // =============================
  // RESPONSIBLE (R)
  // =============================
  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_responsible',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  responsibles: User[];

  // =============================
  // CONSULTED (C)
  // =============================
  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_consulted',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  consulteds: User[];

  // =============================
  // INFORMED (I)
  // =============================
  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_informed',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  informeds: User[];

  // =============================
  // OTHER FIELDS
  // =============================
  @Column({
    type: 'enum',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM',
  })
  priority: string;

  @Column({
    type: 'enum',
    enum: [
      'ON TRACK',
      'IN PROGRESS',
      'STAGNANT',
      'PENDING',
      'PENDING CLOSING',
      'CLOSED',
    ],
    default: 'ON TRACK',
  })
  status: string;

  @Column({ type: 'date', nullable: true })
  due_date: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn()
  created_at: Date;
}
