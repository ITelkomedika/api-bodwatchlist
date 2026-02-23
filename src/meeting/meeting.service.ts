import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeminiService } from './gemini.service';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class MeetingService {
  constructor(
    private gemini: GeminiService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async extract(notes: string) {
    const users = await this.userRepo.find();

    const userList = users
      .map((u) => `${u.division} - ${u.name} (ID:${u.id})`)
      .join('\n');

    const aiResult = await this.gemini.extractTasks(notes, userList);

    return aiResult.map((task) => {
      const accountable =
        users.find((u) => u.id === task.accountableId) || null;

      const responsible = users.filter((u) =>
        task.responsibleIds.includes(u.id),
      );

      const consulted = users.filter((u) => task.consultedIds.includes(u.id));

      const informed = users.filter((u) => task.informedIds.includes(u.id));

      return {
        ...task,
        accountable,
        responsible,
        consulted,
        informed,
      };
    });
    // const users = await this.userRepo.find();
    // const userList = users.map((u) => `${u.name} (ID:${u.id})`).join(', ');
    // return this.gemini.extractTasks(notes, userList);
  }
}
