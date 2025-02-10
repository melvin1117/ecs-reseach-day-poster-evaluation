import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ranking } from '../entities/rankings.entity';
// import { Poster } from '../entities/posters.entity';

@Injectable()
export class RankedPostersService {
    constructor(
        @InjectRepository(Ranking)
        private rankingsRepo: Repository<Ranking>,
    ) { }

    async getRankedPosters() {
        return await this.rankingsRepo
            .createQueryBuilder('ranking')
            .leftJoinAndSelect('ranking.poster_id', 'poster')
            .leftJoinAndSelect('poster.event_id', 'event')
            .leftJoinAndSelect('poster.advisor_id', 'advisor')
            .orderBy('ranking.rank', 'ASC')
            .getMany();
    }
}
