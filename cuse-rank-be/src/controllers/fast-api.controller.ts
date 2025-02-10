import { Controller, Get, Post, Query, Headers, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { FastApiService } from '../services/fast-api.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('fast-api')
export class FastApiController {
  constructor(private readonly fastApiService: FastApiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('start-task')
  async startTask(
    @Headers('Authorization') authHeader: string,
    @Query('eventId') eventId: string
  ) {
    if (!authHeader) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (!eventId) {
      throw new HttpException('eventId is required', HttpStatus.BAD_REQUEST);
    }

    return this.fastApiService.startTask(eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('task-status')
  async getTaskStatus(
    @Headers('Authorization') authHeader: string,
    @Query('taskId') taskId: string
  ) {
    if (!authHeader) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (!taskId) {
      throw new HttpException('taskId is required', HttpStatus.BAD_REQUEST);
    }

    return this.fastApiService.getTaskStatus(taskId);
  }
}
