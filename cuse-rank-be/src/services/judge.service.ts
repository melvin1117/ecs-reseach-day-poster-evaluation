import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { JudgeMaster } from '../entities/judges_master.entity';
import { EventJudge } from '../entities/event_judges.entity';
import { JudgeAssignment } from '../entities/judge_assignments.entity';
import { Poster } from '../entities/posters.entity';

@Injectable()
export class JudgeService {
    constructor(
        @InjectRepository(JudgeMaster)
        private judgesRepo: Repository<JudgeMaster>,

        @InjectRepository(EventJudge)
        private eventJudgesRepo: Repository<EventJudge>,

        @InjectRepository(JudgeAssignment)
        private judgeAssignmentsRepo: Repository<JudgeAssignment>,

        @InjectRepository(Poster)
        private postersRepo: Repository<Poster>,
    ) { }

    async getJudgeAssignedPosters(judgeEmail: string, uniqueCode: string) {
        // Step 1: Extract NetID from Email
        const netID = judgeEmail.split('@')[0];

        // Find all judges with matching NetID in `judges_master`
        const matchingJudges = await this.judgesRepo.find({
            where: { email: Like(`${netID}@%`) }, // Matches all emails with the same NetID
            select: ['id'],
        });

        if (!matchingJudges.length) {
            throw new NotFoundException(`No judge found with NetID: ${netID}`);
        }

        // Extract all matched judge IDs
        const judgeIds = matchingJudges.map(judge => judge.id);

        // Step 2: Find Matching Event in `event_judges` using judge_id & unique_code
        const eventJudges = await this.eventJudgesRepo.find({
            where: { judge_id: In(judgeIds), unique_code: uniqueCode }, // Matching uniqueCode & judge_id
            select: ['id', 'event_id', 'judge_id'],
        });

        if (!eventJudges.length) {
            throw new NotFoundException('No matching event found for this judge with the provided unique code');
        }

        const eventJudgeIds = eventJudges.map(ej => ej.id);
        const eventIds = eventJudges.map(ej => ej.event_id);

        // Step 3: Find Assigned Posters in `judge_assignments`
        const judgeAssignments = await this.judgeAssignmentsRepo.find({
            where: { judge_id: In(judgeIds), event_id: In(eventIds) },
            select: ['poster_id', 'relevance_score'],
        });

        if (!judgeAssignments.length) {
            throw new NotFoundException('No poster assignments found for this judge');
        }

        const posterIds = judgeAssignments.map(ja => ja.poster_id);
        const relevanceScoresMap = new Map(judgeAssignments.map(ja => [String(ja.poster_id), ja.relevance_score]));

        // Step 4: Fetch Posters Details
        const posters = await this.postersRepo.find({
            where: { id: In(posterIds) },
            select: ['id', 'event_id', 'title', 'abstract', 'advisor_id', 'program', 'created_at'],
        });

        if (!posters.length) {
            throw new NotFoundException('No posters found for the assigned poster IDs');
        }

        // Attach relevance score to the poster details
        const response = posters.map(poster => ({
            id: poster.id,
            event_id: poster.event_id,
            title: poster.title,
            abstract: poster.abstract,
            advisor_id: poster.advisor_id,
            program: poster.program,
            created_at: poster.created_at,
            relevance_score: relevanceScoresMap.get(String(poster.id)), // Ensure ID is treated as string
        }));

        return { message: 'Assigned posters retrieved successfully', posters: response };
    }
}
