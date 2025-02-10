// assignment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventJudge } from 'src/entities/event_judges.entity';
import { JudgeAssignment } from 'src/entities/judge_assignments.entity';
import { JudgeMaster } from 'src/entities/judges_master.entity';
import { Poster } from 'src/entities/posters.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(JudgeAssignment)
    private readonly judgeAssignmentRepo: Repository<JudgeAssignment>,
  ) {}

  async getAssignmentsByEvent(eventId: string) {
    // First, check if there are any assignments for the given event_id.
    const assignmentCount = await this.judgeAssignmentRepo.count({ where: { event_id: { id: eventId } } });
    
    if (assignmentCount === 0) {
      throw new NotFoundException('No assignment done yet for this event');
    }

    /* 
       Use the query builder to join:
         - judge_assignments (alias: ja)
         - event_judges (alias: ej) via ja.judge_id = ej.id
         - judges_master (alias: jm) via ej.judge_id = jm.id
         - posters (alias: p) via ja.poster_id = p.id

       We select only the needed columns and then group by each judge (event_judges row).
    */
    const rawAssignments = await this.judgeAssignmentRepo
      .createQueryBuilder('ja')
      // Join event_judges table
      .leftJoin(EventJudge, 'ej', 'ja.judge_id = ej.id')
      // Join judges_master table
      .leftJoin(JudgeMaster, 'jm', 'ej.judge_id = jm.id')
      // Join posters table
      .leftJoin(Poster, 'p', 'ja.poster_id = p.id')
      .where('ja.event_id = :eventId', { eventId })
      .select([
        'ja.id AS ja_id',
        'ej.id AS ej_id',
        'ej.unique_code AS ej_unique_code',
        'jm.name AS judge_name',
        'p.id AS poster_id',
        'p.title AS poster_title',
        'p.abstract AS poster_abstract',
        'p.slots AS slot'
      ])
      .getRawMany();

    // Group the assignments by the judge (using the event_judges id)
    const grouped = {};
    for (const row of rawAssignments) {
      const judgeKey = row.ej_id;
      if (!grouped[judgeKey]) {
        grouped[judgeKey] = {
          judgeName: row.judge_name,
          uniqueCode: row.ej_unique_code,
          posters: [],
        };
      }
      grouped[judgeKey].posters.push({
        id: row.poster_id,
        title: row.poster_title,
        abstract: row.poster_abstract,
        slot: row.slot
      });
    }

    return {
      event_id: eventId,
      assignments: Object.values(grouped),
    };
  }
}
