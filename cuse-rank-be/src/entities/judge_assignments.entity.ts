import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique, JoinColumn } from 'typeorm';
import { EventJudge } from './event_judges.entity';
import { Poster } from './posters.entity';
import { Event } from './events.entity';

@Entity('judge_assignments')
@Unique(['judge_id', 'poster_id'])
export class JudgeAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event_id: Event;

  @ManyToOne(() => EventJudge)
  @JoinColumn({ name: 'judge_id' })
  judge_id: EventJudge;

  @ManyToOne(() => Poster)
  @JoinColumn({ name: 'poster_id' })
  poster_id: Poster;

  @Column({ type: 'float', nullable: true })
  relevance_score: number;

  @CreateDateColumn({ type: 'timestamp' })
  assigned_at: Date;
}
