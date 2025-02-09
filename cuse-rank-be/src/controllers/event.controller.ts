import { Controller, Get, Post, Put, Delete, Body, UseGuards, Headers, Param, Query } from '@nestjs/common';
import { EventService } from '../services/event.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserEvents(@Headers('Authorization') authHeader: string, @Query('eventId') eventId?: string) {
    return await this.eventService.getUserEvents(authHeader, eventId);

  }

  @UseGuards(JwtAuthGuard)
  @Get('/organizers')
  async getAllOrganizers(@Headers('Authorization') authHeader: string) {
    return await this.eventService.getAllOrganizers(authHeader);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createEvent(@Headers('Authorization') authHeader: string, @Body() eventData: any) {
    return await this.eventService.createEvent(authHeader, eventData);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateEvent(@Headers('Authorization') authHeader: string, @Param('id') eventId: string, @Body() updateData: any) {
    return await this.eventService.updateEvent(authHeader, eventId, updateData);
  }

  /**
   * DELETE - This endpoint handles both:
   * 1. Deleting all events if no event ID is provided.
   * 2. Deleting a specific event if an event ID is provided.
   */
  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteEvents(@Headers('Authorization') authHeader: string, @Query('eventId') eventId?: string) {
    if (eventId) {
      return await this.eventService.deleteEvent(authHeader, eventId);
    } else {
      return await this.eventService.deleteAllEvents(authHeader);
    }
  }
}
