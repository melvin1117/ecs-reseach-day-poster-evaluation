import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique, JoinColumn } from 'typeorm';
import { EventJudge } from './event_judges.entity';
import { Poster } from './posters.entity';

@Entity('evaluations')
@Unique(['judge_id', 'poster_id'])
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EventJudge)
  @JoinColumn({ name: 'judge_id' })
  judge_id: EventJudge;

  @ManyToOne(() => Poster)
  @JoinColumn({ name: 'poster_id' })
  poster_id: Poster;

  @Column({ type: 'jsonb' })
  scores: object;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
