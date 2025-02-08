import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Event } from './entities/events.entity';
import { Organizer } from './entities/organizers.entity';
import { JudgeMaster } from './entities/judges_master.entity';
import { EventJudge } from './entities/event_judges.entity';
import { Poster } from './entities/posters.entity';
import { JudgeAssignment } from './entities/judge_assignments.entity';
import { Evaluation } from './entities/evaluations.entity';
import { Ranking } from './entities/rankings.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'cuse_rank',
      entities: [
        User, Event, Organizer, JudgeMaster, EventJudge, Poster, JudgeAssignment, Evaluation, Ranking
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      User, Event, Organizer, JudgeMaster, EventJudge, Poster, JudgeAssignment, Evaluation, Ranking
    ])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
