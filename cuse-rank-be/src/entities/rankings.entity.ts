import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Event } from './events.entity';
import { Poster } from './posters.entity';

@Entity('rankings')
export class Ranking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event_id: Event;

  @ManyToOne(() => Poster)
  @JoinColumn({ name: 'poster_id' })
  poster_id: Poster;

  @Column()
  rank: number;

  @Column({ type: 'float' })
  final_score: number;

  @Column({ type: 'float' })
  weighted_score: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
