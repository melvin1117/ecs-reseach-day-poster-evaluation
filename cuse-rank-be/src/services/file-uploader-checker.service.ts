import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventJudge } from 'src/entities/event_judges.entity';
import { Poster } from 'src/entities/posters.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FileUploadedCheckerService {
  constructor(
    @InjectRepository(EventJudge)
    private readonly eventJudgeRepository: Repository<EventJudge>,

    @InjectRepository(Poster)
    private readonly posterRepository: Repository<Poster>,
  ) {}

  async checkIfFilesUploaded(eventId: string): Promise<{ hasJudges: boolean; hasPosters: boolean }> {
    const judgeCount = await this.eventJudgeRepository.count({
      where: { event_id: { id: eventId } } // Adjusted for object reference
    });

    const posterCount = await this.posterRepository.count({
      where: { event_id: { id: eventId } } // Adjusted for object reference
    });

    return {
      hasJudges: judgeCount > 0,
      hasPosters: posterCount > 0,
    };
  }
}
