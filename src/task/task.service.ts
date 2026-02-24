import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Brackets } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskResponsible } from './entities/task-responsible.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TaskService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskResponsible)
    private readonly mentionRepo: Repository<TaskResponsible>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // async findAll(user: any) {
  //   const tasks = await this.taskRepo.find({
  //     relations: ['primaryAssignee', 'createdBy'],
  //     order: { id: 'DESC' },
  //   });

  //   // Kalau SECRETARY → lihat semua
  //   if (user.role === 'SECRETARY') {
  //     return tasks;
  //   }

  //   // Kalau UNIT → hanya tugas dia
  //   return tasks.filter((t) => t.primaryAssignee?.id === user.sub);
  // }

  // async findAll(user: any, search?: string, accountableId?: number) {
  //   const qb = this.taskRepo
  //     .createQueryBuilder('task')
  //     .leftJoinAndSelect('task.primaryAssignee', 'primaryAssignee')
  //     .leftJoinAndSelect('task.createdBy', 'createdBy')
  //     .leftJoinAndSelect('task.responsibles', 'responsibles')
  //     .leftJoinAndSelect('task.consulteds', 'consulteds')
  //     .leftJoinAndSelect('task.informeds', 'informeds')
  //     .orderBy('task.id', 'DESC');

  //   // 🔎 SEARCH TITLE
  //   if (search) {
  //     qb.andWhere('LOWER(task.title) LIKE :search', {
  //       search: `%${search.toLowerCase()}%`,
  //     });
  //   }

  //   // 👤 FILTER ACCOUNTABLE
  //   if (accountableId) {
  //     qb.andWhere('primaryAssignee.id = :accountableId', {
  //       accountableId,
  //     });
  //   }

  //   const tasks = await qb.getMany();

  //   const shaped = tasks.map((t) => ({
  //     id: t.id,
  //     title: t.title,
  //     description: t.description,
  //     priority: t.priority,
  //     status: t.status,
  //     meetingDate: '-',
  //     dueDate: t.due_date,
  //     originalDueDate: t.due_date,
  //     createdAt: t.created_at,
  //     createdBy: t.createdBy,
  //     raci: {
  //       accountable: t.primaryAssignee,
  //       responsible: t.responsibles || [],
  //       consulted: t.consulteds || [],
  //       informed: t.informeds || [],
  //     },
  //     updates: [],
  //     requiresEvidence: false,
  //   }));

  //   const userId = user.userId ?? user.id ?? user.sub;

  //   // 🔐 ROLE FILTERING
  //   if (user.role === 'SECRETARY') {
  //     return shaped;
  //   }
  //   console.log('USER OBJECT:', user);

  //   return shaped.filter(
  //     (t) =>
  //       t.raci.accountable?.id === userId ||
  //       t.raci.responsible?.some((r) => r.id === userId),
  //   );
  //   // const tasks = await this.taskRepo.find({
  //   //   relations: [
  //   //     'primaryAssignee',
  //   //     'createdBy',
  //   //     'responsibles',
  //   //     'consulteds',
  //   //     'informeds',
  //   //   ],
  //   //   select: {
  //   //     id: true,
  //   //     title: true,
  //   //     description: true,
  //   //     priority: true,
  //   //     status: true,
  //   //     due_date: true,
  //   //     created_at: true,

  //   //     primaryAssignee: {
  //   //       id: true,
  //   //       username: true,
  //   //       name: true,
  //   //       role: true,
  //   //       avatar_seed: true,
  //   //     },

  //   //     createdBy: {
  //   //       id: true,
  //   //       username: true,
  //   //       name: true,
  //   //       role: true,
  //   //       avatar_seed: true,
  //   //     },

  //   //     responsibles: {
  //   //       id: true,
  //   //       username: true,
  //   //       name: true,
  //   //       role: true,
  //   //       avatar_seed: true,
  //   //     },

  //   //     consulteds: {
  //   //       id: true,
  //   //       username: true,
  //   //       name: true,
  //   //       role: true,
  //   //       avatar_seed: true,
  //   //     },

  //   //     informeds: {
  //   //       id: true,
  //   //       username: true,
  //   //       name: true,
  //   //       role: true,
  //   //       avatar_seed: true,
  //   //     },
  //   //   },
  //   //   order: { id: 'DESC' },
  //   // });

  //   // const shaped = tasks.map((t) => ({
  //   //   id: t.id.toString(),
  //   //   title: t.title,
  //   //   description: t.description,
  //   //   priority: t.priority,
  //   //   status: t.status,
  //   //   meetingDate: '-', // kalau belum ada field
  //   //   dueDate: t.due_date,
  //   //   originalDueDate: t.due_date,
  //   //   createdAt: t.created_at,
  //   //   createdBy: t.createdBy,

  //   //   raci: {
  //   //     accountable: t.primaryAssignee,
  //   //     responsible: t.responsibles || [],
  //   //     consulted: t.consulteds || [],
  //   //     informed: t.informeds || [],
  //   //   },

  //   //   updates: [],
  //   //   requiresEvidence: false,
  //   // }));

  //   // if (user.role === 'SECRETARY') {
  //   //   return shaped;
  //   // }

  //   // return shaped.filter(
  //   //   (t) =>
  //   //     t.raci.accountable?.id === user.sub ||
  //   //     t.raci.responsible?.some((r) => r.id === user.sub),
  //   // );
  // }

  async findAll(user: any, search?: string, accountableId?: number) {
    const qb = this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.primaryAssignee', 'primaryAssignee')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.responsibles', 'responsibles')
      .leftJoinAndSelect('task.consulteds', 'consulteds')
      .leftJoinAndSelect('task.informeds', 'informeds')
      .orderBy('task.id', 'DESC');

    // 🔎 SEARCH
    if (search) {
      qb.andWhere('LOWER(task.title) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    // 👤 FILTER ACCOUNTABLE (manual filter dari query param)
    if (accountableId) {
      qb.andWhere('primaryAssignee.id = :accountableId', {
        accountableId,
      });
    }

    const userId = user.userId ?? user.id ?? user.sub;

    // 🔐 ROLE FILTERING
    if (user.role !== 'SECRETARY') {
      qb.andWhere('primaryAssignee.id = :userId', { userId });
    }

    const tasks = await qb.getMany();

    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      meetingDate: '-',
      dueDate: t.due_date,
      originalDueDate: t.due_date,
      createdAt: t.created_at,
      createdBy: t.createdBy,
      raci: {
        accountable: t.primaryAssignee,
        responsible: t.responsibles || [],
        consulted: t.consulteds || [],
        informed: t.informeds || [],
      },
      updates: [],
      requiresEvidence: false,
    }));
  }

  // async bulkCreate(tasks: any[]) {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     for (const t of tasks) {
  //       const accountable = await this.userRepo.findOneBy({
  //         id: Number(t.accountableId),
  //       });

  //       if (!accountable) {
  //         throw new Error(`User ${t.accountableId} not found`);
  //       }
  //       const parsedDueDate = t.dueDate ? new Date(t.dueDate) : null;

  //       if (!parsedDueDate || isNaN(parsedDueDate.getTime())) {
  //         throw new Error(`Invalid dueDate for task: ${t.title}`);
  //       }

  //       const taskEntity = this.taskRepo.create({
  //         title: t.title,
  //         description: t.description,
  //         primaryAssignee: accountable,
  //         priority: t.priority,
  //         due_date: parsedDueDate,
  //         createdBy: { id: 1 } as any,
  //       });

  //       const savedTask = await queryRunner.manager.save(taskEntity);

  //       const mentions = [
  //         ...(t.responsibleIds || []),
  //         ...(t.consultedIds || []),
  //         ...(t.informedIds || []),
  //       ];

  //       for (const userId of mentions) {
  //         await queryRunner.manager.save(TaskResponsible, {
  //           task_id: savedTask.id,
  //           user_id: Number(userId),
  //         });
  //       }
  //     }

  //     await queryRunner.commitTransaction();

  //     return { message: 'Tasks successfully distributed' };
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  async bulkCreate(tasks: any[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const t of tasks) {
        const accountable = await this.userRepo.findOneBy({
          id: Number(t.accountableId),
        });

        if (!accountable) {
          throw new Error(`User ${t.accountableId} not found`);
        }

        const parsedDueDate =
          t.dueDate && !isNaN(new Date(t.dueDate).getTime())
            ? new Date(t.dueDate)
            : new Date(); // fallback hari ini

        if (!parsedDueDate || isNaN(parsedDueDate.getTime())) {
          throw new Error(`Invalid dueDate for task: ${t.title}`);
        }

        const taskEntity = this.taskRepo.create({
          title: t.title,
          description: t.description,
          primaryAssignee: accountable,
          priority: t.priority,
          due_date: parsedDueDate,
          createdBy: { id: 1 } as any,
        });

        const savedTask = await queryRunner.manager.save(taskEntity);

        const mentions = [
          ...(t.responsibleIds || []),
          ...(t.consultedIds || []),
          ...(t.informedIds || []),
        ];

        for (const userId of mentions) {
          await queryRunner.manager.save(TaskResponsible, {
            task_id: savedTask.id,
            user_id: Number(userId),
          });
        }
      }

      await queryRunner.commitTransaction();

      return { message: 'Tasks successfully distributed' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: number, status: string) {
    const task = await this.taskRepo.findOneBy({ id });

    if (!task) {
      throw new Error('Task not found');
    }

    task.status = status as any;

    return this.taskRepo.save(task);
  }

  async updateRaci(id: number, accountableId: number) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['primaryAssignee'],
    });

    if (!task) throw new Error('Task not found');

    const newUser = await this.userRepo.findOneBy({
      id: accountableId,
    });

    if (!newUser) throw new Error('User not found');

    task.primaryAssignee = newUser;

    return this.taskRepo.save(task);
  }

  async addUpdate(
    taskId: number,
    content: string,
    user: any,
    mentions: number[],
  ) {
    const task = await this.taskRepo.findOneBy({ id: taskId });
    if (!task) throw new Error('Task not found');

    const update = {
      task_id: taskId,
      user_id: user.sub,
      content,
    };

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into('task_updates')
      .values(update)
      .execute();

    // Simpan mention jika ada
    for (const m of mentions) {
      await this.mentionRepo.save({
        task_id: taskId,
        user_id: m,
      });
    }

    return { message: 'Update added successfully' };
  }
}
