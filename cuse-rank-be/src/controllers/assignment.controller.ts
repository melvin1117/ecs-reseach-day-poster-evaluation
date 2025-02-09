// assignment.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AssignmentService } from '../services/assignment.service';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Get()
  async getAssignments(@Query('event_id') eventId: string) {
    if (!eventId) {
      throw new BadRequestException('event_id query parameter is required');
    }
    const result = await this.assignmentService.getAssignmentsByEvent(eventId);
    return result;
  }
}
