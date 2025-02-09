import { Controller, Post, Param } from '@nestjs/common';
import { ScoringService } from '../services/scoring.service';

@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Post(':eventId')
  async calculateScores(@Param('eventId') eventId: string) {
    await this.scoringService.calculateAndStoreScores(eventId);
    return { message: 'Scores calculated and stored successfully.' };
  }
}