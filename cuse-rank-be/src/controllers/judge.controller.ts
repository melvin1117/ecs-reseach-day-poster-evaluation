import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { JudgeService } from '../services/judge.service';

@Controller('judges')
export class JudgeController {
    constructor(private readonly judgeService: JudgeService) { }

    @Get('/assigned-posters')
    async getJudgeAssignedPosters(
        @Query('email') judgeEmail: string,
        @Query('uniqueCode') uniqueCode: string,
    ) {
        if (!judgeEmail || !uniqueCode) {
            throw new NotFoundException('Judge email and unique code are required');
        }

        return await this.judgeService.getJudgeAssignedPosters(judgeEmail, uniqueCode);
    }
}
