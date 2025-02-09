import { Controller, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { EventService } from '../services/event_post_service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createEvent(
    @Headers('Authorization') authHeader: string,
    @Body()
    eventData: {
      name: string;
      description: string;
      start_date: Date;
      end_date: Date;
      judging_start_time: Date;
      judging_end_time: Date;
      min_posters_per_judge: number;
      max_posters_per_judge: number;
      judges_per_poster: number;
      criteria: object;
    },
  ) {
    return await this.eventService.createEvent(authHeader, eventData);
  }
}