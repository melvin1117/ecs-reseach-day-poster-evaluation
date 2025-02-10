import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ranking } from '../entities/rankings.entity';

@Injectable()
export class ScoringQueryService {
  constructor(
    @InjectRepository(Ranking)
    private rankingsRepo: Repository<Ranking>,
  ) {}

  async getScoresAndRanks(eventId: string) {
    eventId = eventId.trim();
    const rankings = await this.rankingsRepo.find({
      where: { event_id: { id: eventId } },
      relations: ['poster_id', 'event_id'],
      order: { rank: 'ASC' },
    });

    if (!rankings.length) {
      throw new Error(`No rankings found for event ID: ${eventId}`);
    }

    return rankings.map((ranking) => ({
      posterId: ranking.poster_id.id,
      finalScore: ranking.final_score,
      weightedScore: ranking.weighted_score,
      rank: ranking.rank,
    }));
  }
}
