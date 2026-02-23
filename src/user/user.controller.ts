import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('leader-demography')
  async leaderDemography() {
    return this.userService.getLeaderDemography();
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }
}
