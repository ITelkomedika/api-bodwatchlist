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
  ParseIntPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateTaskUpdateDto } from './dto/task-update-dto';

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
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { accountableId: number },
    @Req() req: any,
  ) {
    return this.taskService.updateRaci(id, body.accountableId, req.user);
  }

  @Post(':id/updates')
  async addUpdate(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() dto: CreateTaskUpdateDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;

    return this.taskService.addUpdate(taskId, userId, dto);
  }
}
