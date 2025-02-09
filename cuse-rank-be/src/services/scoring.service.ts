import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from '../entities/evaluations.entity';
import { Ranking } from '../entities/rankings.entity';
import { Poster } from '../entities/posters.entity';
import { Event } from '../entities/events.entity';
import { JudgeAssignment } from '../entities/judge_assignments.entity';

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(Evaluation)
    private evaluationsRepo: Repository<Evaluation>,

    @InjectRepository(Ranking)
    private rankingsRepo: Repository<Ranking>,

    @InjectRepository(Poster)
    private postersRepo: Repository<Poster>,

    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,

    @InjectRepository(JudgeAssignment)
    private judgeAssignmentsRepo: Repository<JudgeAssignment>,
  ) {}

  async calculateAndStoreScores(eventId: string) {
    eventId = eventId.trim();

    const evaluations = await this.evaluationsRepo.find({
      relations: ['judge_id', 'poster_id'],
    });

    const posters = await this.postersRepo.find({ where: { event_id: { id: eventId } } });

    if (!posters.length) {
      throw new Error(`No posters found for event ID: ${eventId}`);
    }

    const criteriaWeightage = await this.getCriteriaWeightage(eventId);
    const normalizedWeights = this.normalizeWeightage(criteriaWeightage);

    const scores: Record<string, { finalScore: number; weightedScore: number }> = {};

    for (const poster of posters) {
      const posterEvaluations = evaluations.filter(e => e.poster_id.id === poster.id);
      if (posterEvaluations.length !== 2) continue;

      let weightedSum = 0;
      let relevanceSum = 0;

      for (const evalData of posterEvaluations) {
        const { scores: judgeScores, judge_id } = evalData;
        const relevance = await this.getJudgeRelevance(judge_id.id, poster.id);
        
        let judgeScore = 0;
        if (judgeScores && typeof judgeScores === 'object') {
          for (const criterion of Object.keys(judgeScores)) {
            judgeScore += Number(judgeScores[criterion] || 0) * (normalizedWeights[criterion] || 0);
          }
        }
        weightedSum += judgeScore * relevance;
        relevanceSum += relevance;
      }
      
      let finalScore = relevanceSum !== 0 ? parseFloat((weightedSum / relevanceSum).toFixed(2)) : 0;
      let weightedScore = parseFloat((weightedSum / 2).toFixed(2));
      
      scores[poster.id] = { finalScore, weightedScore };
    }

    const sortedRankings = await Promise.all(
      Object.entries(scores).map(async ([posterId, { finalScore, weightedScore }], index) => {
        const eventRef = await this.eventsRepo.findOne({ where: { id: eventId } });
        const posterRef = await this.postersRepo.findOne({ where: { id: posterId } });

        return {
          event_id: eventRef, // Now correctly referencing Event entity
          poster_id: posterRef, // Now correctly referencing Poster entity
          final_score: finalScore,
          weighted_score: weightedScore,
          rank: index + 1,
        };
      })
    );
    console.log('Saving rankings:', sortedRankings);
    await this.rankingsRepo.save(sortedRankings);
    console.log('Rankings saved successfully.');

  }

  normalizeWeightage(weights: Record<string, number>) {
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    return Object.fromEntries(
      Object.entries(weights).map(([k, v]) => [k, v / total])
    );
  }

  async getCriteriaWeightage(eventId: string) {
    const event = await this.eventsRepo.findOne({ where: { id: eventId } });
    return event?.criteria && Array.isArray(event.criteria)
      ? Object.fromEntries(event.criteria.map(({ name, weight }) => [name, weight]))
      : {};
  }

  async getJudgeRelevance(judgeId, posterId) {
    const assignment = await this.judgeAssignmentsRepo.findOne({ where: { judge_id: judgeId, poster_id: posterId } });
    return assignment ? parseFloat(assignment.relevance_score.toFixed(2)) : 0.5;
  }
}