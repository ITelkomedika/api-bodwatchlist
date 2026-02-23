import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getLeaderDemography() {
    const data = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('tasks', 'task', 'task.accountable_id = user.id')

      .select('user.id', 'id')
      .addSelect('user.name', 'name')
      .addSelect('user.role', 'role')
      .addSelect('user.avatar_seed', 'avatar_seed')
      .addSelect('user.division', 'division')

      .addSelect(
        `SUM(CASE WHEN task.status = 'ON TRACK' THEN 1 ELSE 0 END)`,
        'onTrack',
      )
      .addSelect(
        `SUM(CASE WHEN task.status = 'IN PROGRESS' THEN 1 ELSE 0 END)`,
        'inProgress',
      )
      .addSelect(
        `SUM(CASE WHEN task.status = 'PENDING' THEN 1 ELSE 0 END)`,
        'pending',
      )
      .addSelect(
        `SUM(CASE WHEN task.status = 'STAGNANT' THEN 1 ELSE 0 END)`,
        'stagnant',
      )
      .addSelect(
        `SUM(CASE WHEN task.status = 'PENDING CLOSING' THEN 1 ELSE 0 END)`,
        'pendingClosing',
      )
      .addSelect(
        `SUM(CASE WHEN task.status = 'CLOSED' THEN 1 ELSE 0 END)`,
        'closed',
      )

      .groupBy('user.id')
      .getRawMany();

    return data.map((d) => ({
      id: Number(d.id),
      name: d.name,
      role: d.role,
      avatar_seed: d.avatar_seed,
      division: d.division,
      'ON TRACK': Number(d.onTrack),
      'IN PROGRESS': Number(d.inProgress),
      PENDING: Number(d.pending),
      STAGNANT: Number(d.stagnant),
      'PENDING CLOSING': Number(d.pendingClosing),
      CLOSED: Number(d.closed),
    }));
  }

  async findAll() {
    return this.userRepo.find({
      select: ['id', 'name', 'role', 'avatar_seed'],
      order: { name: 'ASC' },
    });
  }
}
