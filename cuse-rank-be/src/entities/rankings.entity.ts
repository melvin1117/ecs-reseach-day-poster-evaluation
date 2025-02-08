import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Event } from './events.entity';
import { Poster } from './posters.entity';

@Entity('rankings')
export class Ranking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event)
  event_id: Event;

  @ManyToOne(() => Poster)
  poster_id: Poster;

  @Column()
  rank: number;

  @Column({ type: 'float' })
  final_score: number;

  @Column({ type: 'float' })
  waited_score: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
