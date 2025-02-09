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
    const eventJudge = await this.eventJudgesRepo.findOne({
      where: {
        judge_id: judge,
        unique_code: uniqueCode,
      },
    });


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
    const assignments = await this.judgeAssignmentsRepo
      .createQueryBuilder('ja')
      // Join with posters table using poster_id
      .innerJoin(
        Poster,
        'p',
        'p.id = ja.poster_id',
      )
      // Left join with judges_master to get advisor details (if any)
      .leftJoin(
        JudgeMaster,
        'advisor',
        'advisor.id = p.advisor_id',
      )
      .where('ja.judge_id = :eventJudgeId', { eventJudgeId: eventJudge.id })
      .andWhere('ja.event_id = :eventId', { eventId: eventJudge.event_id })
      // Select only the needed columns.
      .select([
        'ja.relevance_score AS relevance_score',
        'p.title AS title',
        'p.abstract AS abstract',
        'p.program AS program',
        'p.slot AS slot',
        'p.advisor_id AS advisor_id',
        'advisor.name AS advisor_name',
      ])
      .getRawMany();

    //
    // 4. Group the poster assignments by the poster's slot.
    //
    // The final response will include each poster with its details and the relevance score.
    //
    const groupedPosters = {};
    assignments.forEach((a) => {
      const slot = a.slot; // Assuming slot values like 1 or 2
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
      dept: judge.department,
      event_id: eventJudge.event_id,
      posters: groupedPosters, // Grouped by the poster's slot
    };

    return response;
  }
}
