import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskResponsible } from './entities/task-responsible.entity';
import { User } from 'src/user/entities/user.entity';
import { TaskUpdate } from './entities/task-update.entity';
import { CreateTaskUpdateDto } from './dto/task-update-dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskResponsible)
    private readonly mentionRepo: Repository<TaskResponsible>,
    @InjectRepository(TaskUpdate)
    private readonly taskUpdateRepo: Repository<TaskUpdate>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(user: any, search?: string, accountableId?: number) {
    const qb = this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.primaryAssignee', 'primaryAssignee')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.responsibles', 'responsibles')
      .leftJoinAndSelect('task.consulteds', 'consulteds')
      .leftJoinAndSelect('task.informeds', 'informeds')
      .leftJoinAndSelect('task.updates', 'updates')
      .leftJoinAndSelect('updates.user', 'updateUser')
      .orderBy('task.id', 'DESC')
      .addOrderBy('updates.created_at', 'DESC');

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
      updates: (t.updates ?? [])
        .slice() // clone supaya aman
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .map((u) => ({
          id: u.id,
          content: u.content,
          date: u.created_at,
          evidenceFileName: u.evidence_path,
          user: u.user,
        })),
      requiresEvidence: false,
    }));
  }

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

  async updateRaci(id: number, accountableId: number, currentUser: any) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['primaryAssignee'],
    });

    if (!task) throw new NotFoundException('Task not found');

    const newUser = await this.userRepo.findOneBy({
      id: accountableId,
    });

    if (!newUser) throw new NotFoundException('User not found');

    const oldUser = task.primaryAssignee;

    // Update accountable
    task.primaryAssignee = newUser;
    await this.taskRepo.save(task);

    // 🔥 Ambil actor
    const actorId = currentUser.userId ?? currentUser.id ?? currentUser.sub;

    const actor = await this.userRepo.findOneBy({ id: actorId });

    if (!actor) {
      throw new NotFoundException('Actor not found');
    }

    // 🔥 Sekarang TypeScript aman
    const updateLog = this.taskUpdateRepo.create({
      task: task,
      user: actor,
      content: `🔄 Accountable diubah dari ${oldUser.name} menjadi ${newUser.name}`,
    });

    await this.taskUpdateRepo.save(updateLog);

    return this.taskRepo.findOne({
      where: { id },
      relations: ['primaryAssignee', 'updates', 'updates.user'],
    });
  }

  async addUpdate(taskId: number, userId: number, dto: CreateTaskUpdateDto) {
    // =============================
    // 1️⃣ VALIDATE TASK
    // =============================
    const task = await this.taskRepo.findOneBy({ id: taskId });
    if (!task) throw new Error('Task not found');

    // =============================
    // 2️⃣ VALIDATE USER
    // =============================
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    // =============================
    // 4️⃣ CREATE UPDATE ENTITY
    // =============================
    const update = this.taskUpdateRepo.create({
      task,
      user,
      content: dto.content,
      evidence_path: dto.evidence ?? null,
      suggested_status: dto.status || null,
    });

    const saved = await this.taskUpdateRepo.save(update);

    // 🔥 Return dengan user relation
    return this.taskUpdateRepo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
  }
}
