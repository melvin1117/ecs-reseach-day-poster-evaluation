import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
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
import { ScoringService } from './services/scoring.service';
import { ScoringController } from './controllers/scoring.controller';
import { ScoringQueryService } from './services/scoring-query.service';
import { ScoringQueryController } from './controllers/scoring-query.controller';
import { AuthController } from './controllers/auth_controller';
import { AuthService } from './services/auth_service';
import { EventController } from './controllers/event.controller';
import { EventService } from './services/event.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UploadController } from './controllers/upload_controller';
import { UploadService } from './services/upload_service';
import { JudgeController } from './controllers/judge.controller';
import { JudgeService } from './services/judge.service';
import { AssignmentService } from './services/assignment.service';
import { AssignmentController } from './controllers/assignment.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '6h' },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'cuse_rank',
      entities: [
        User,
        Event,
        Organizer,
        JudgeMaster,
        EventJudge,
        Poster,
        JudgeAssignment,
        Evaluation,
        Ranking,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      User,
      Event,
      Organizer,
      JudgeMaster,
      EventJudge,
      Poster,
      JudgeAssignment,
      Evaluation,
      Ranking,
    ]),
  ],
  controllers: [
    AppController,
    ScoringController,
    ScoringQueryController,
    AuthController,
    EventController,
    UploadController,
    JudgeController,
    AssignmentController,
  ],
  providers: [
    JwtAuthGuard,
    AppService,
    ScoringService,
    ScoringQueryService,
    AuthService,
    EventService,
    UploadService,
    JudgeService,
    AssignmentService,
  ],
})
export class AppModule {}
