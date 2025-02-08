import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './users.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ type: 'timestamp' })
  judging_start_time: Date;

  @Column({ type: 'timestamp' })
  judging_end_time: Date;

  @ManyToOne(() => User)
  created_by: User;

  @Column({ type: 'int', default: 2 })
  min_posters_per_judge: number;

  @Column({ type: 'int', default: 6 })
  max_posters_per_judge: number;

  @Column({ type: 'int', default: 2 })
  judges_per_poster: number;

  @Column({ type: 'jsonb' })
  criteria: object;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
