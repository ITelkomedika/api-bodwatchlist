import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post('extract')
  async process(@Body() body: { notes: string }) {
    return this.meetingService.extract(body.notes);
  }
}
