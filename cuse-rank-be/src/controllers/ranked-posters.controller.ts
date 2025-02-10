import { Controller, Get } from '@nestjs/common';
import { RankedPostersService } from '../services/ranked-posters.service';

@Controller('ranked-posters')
export class RankedPostersController {
    constructor(private readonly rankedPostersService: RankedPostersService) { }

    @Get()
    async getRankedPosters() {
        return await this.rankedPostersService.getRankedPosters();
    }
}
