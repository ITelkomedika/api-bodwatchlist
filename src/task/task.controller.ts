import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('accountableId') accountableId?: number,
  ) {
    return this.taskService.findAll(user, search, accountableId);
  }

  @Post('bulk-create')
  async bulkCreate(@Body() body: { tasks: any[] }) {
    return this.taskService.bulkCreate(body.tasks);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body() body: { status: string },
  ) {
    return this.taskService.updateStatus(id, body.status);
  }

  @Patch(':id/raci')
  async updateRaci(
    @Param('id') id: number,
    @Body() body: { accountableId: number },
  ) {
    return this.taskService.updateRaci(id, body.accountableId);
  }

  @Post(':id/updates')
  async addUpdate(
    @Param('id') id: number,
    @Body() body: { content: string; mentions?: number[] },
    @CurrentUser() user: any,
  ) {
    return this.taskService.addUpdate(
      id,
      body.content,
      user,
      body.mentions || [],
    );
  }
}
