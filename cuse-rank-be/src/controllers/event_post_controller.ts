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
    @Body() eventData,
  ) {
    return await this.eventService.createEvent(authHeader, eventData);
  }
}
