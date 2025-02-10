import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventJudge } from 'src/entities/event_judges.entity';
import { JudgeAssignment } from 'src/entities/judge_assignments.entity';
import { JudgeMaster } from 'src/entities/judges_master.entity';
import { Poster } from 'src/entities/posters.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JudgeService {
  constructor(
    @InjectRepository(JudgeMaster)
    private readonly judgesMasterRepo: Repository<JudgeMaster>,

    @InjectRepository(EventJudge)
    private readonly eventJudgesRepo: Repository<EventJudge>,

    @InjectRepository(JudgeAssignment)
    private readonly judgeAssignmentsRepo: Repository<JudgeAssignment>,

    @InjectRepository(Poster)
    private readonly postersRepo: Repository<Poster>,
  ) {}

  async getAssignments(netid: string, uniqueCode: string) {
    //
    // 1. Find the judge in judges_master using the netid.
    //
    // We assume that the netid is the part of the email before the '@'.
    // We use the PostgreSQL function split_part to extract that.
    //
    const judge = await this.judgesMasterRepo
      .createQueryBuilder('jm')
      .where("split_part(jm.email, '@', 1) = :netid", { netid })
      .getOne();

    if (!judge) {
      throw new NotFoundException(
        'Judge not found with the provided netid',
      );
    }
    
    //
    // 2. Find the event judge mapping in event_judges by matching judge_id and unique code.
    //
    const eventJudge = await this.eventJudgesRepo
    .createQueryBuilder('ej')
    .leftJoinAndSelect('ej.event_id', 'event')
    .where('ej.unique_code = :uniqueCode', { uniqueCode })
    .andWhere('ej.judge_id = :judgeId', { judgeId: judge.id })
    .getOne();
  

    if (!eventJudge) {
      throw new NotFoundException(
        'No event mapping found for this judge with the provided unique code',
      );
    }

    //
    // 3. Get all judge assignments for this event judge.
    //
    // Note: In judge_assignments, the judge_id refers to the event_judges.id.
    //
    // We use QueryBuilder to join with the posters table (to get poster details)
    // and left join with judges_master (to get the advisor’s name if advisor exists).
    //
    const sql = `
    SELECT
      ja.relevance_score AS relevance_score,
      p.title AS title,
      p.abstract AS abstract,
      p.program AS program,
      p.slots AS slots,
      p.advisor_id AS advisor_id,
      advisor.name AS advisor_name
      FROM judge_assignments AS ja
      INNER JOIN posters AS p
        ON p.id = ja.poster_id
      LEFT JOIN judges_master AS advisor
        ON advisor.id = p.advisor_id
      WHERE ja.judge_id = $1
        AND ja.event_id = $2;
    `;
    
    const assignments = await this.judgeAssignmentsRepo.query(sql, [
      eventJudge.id,
      eventJudge.event_id.id,
    ]);

    //
    // 4. Group the poster assignments by the poster's slot.
    //
    // The final response will include each poster with its details and the relevance score.
    //
    const groupedPosters = {};
    assignments.forEach((a) => {
      const slot = a.slots; // Assuming slot values like 1 or 2
      if (!groupedPosters[slot]) {
        groupedPosters[slot] = [];
      }
      groupedPosters[slot].push({
        title: a.title,
        abstract: a.abstract,
        program: a.program,
        relevance_score: a.relevance_score,
        // If advisor_id is present, include advisor details
        advisor:
          a.advisor_id !== null
            ? {
                advisor_id: a.advisor_id,
                name: a.advisor_name,
              }
            : null,
      });
    });

    //
    // 5. Prepare the final response.
    //
    const response = {
      judge_id: judge.id,
      name: judge.name,
      email: judge.email,
      img: judge.profile_img,
      dept: judge.department,
      event_id: eventJudge.event_id,
      posters: groupedPosters, // Grouped by the poster's slot
    };

    return response;
  }
}
