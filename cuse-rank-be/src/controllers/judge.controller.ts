import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { JudgeService } from '../services/judge.service';

@Controller('judges')
export class JudgeController {
    constructor(private readonly judgeService: JudgeService) { }

    @Get('assignments')
    async getJudgeAssignments(
        @Query('netid') netid: string,
        @Query('uniqueCode') uniqueCode: string,
    ) {
        return this.judgeService.getAssignments(netid, uniqueCode);
    }
}
