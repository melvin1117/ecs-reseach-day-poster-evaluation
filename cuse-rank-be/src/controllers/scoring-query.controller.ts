import { Controller, Get, Param } from '@nestjs/common';
import { ScoringQueryService } from '../services/scoring-query.service';

@Controller('scores')
export class ScoringQueryController {
  constructor(private readonly scoringQueryService: ScoringQueryService) {}

  @Get(':eventId')
  async getScores(@Param('eventId') eventId: string) {
    return await this.scoringQueryService.getScoresAndRanks(eventId);
  }
}
