// src/task-updates/dto/create-task-update.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class CreateTaskUpdateDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  mentions?: number[];

  @IsOptional()
  @IsString()
  evidence?: string; // path file
}
