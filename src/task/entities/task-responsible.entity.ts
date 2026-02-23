import { Entity, PrimaryColumn } from 'typeorm';

@Entity('task_responsible')
export class TaskResponsible {
  @PrimaryColumn()
  task_id: number;

  @PrimaryColumn()
  user_id: number;
}
