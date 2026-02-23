import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { TaskResponsible } from './entities/task-responsible.entity';
import { Task } from './entities/task.entity';
import { TaskController } from './task.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskResponsible, User])],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
