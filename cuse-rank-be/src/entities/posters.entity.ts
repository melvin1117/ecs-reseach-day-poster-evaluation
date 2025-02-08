import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Event } from './events.entity';
import { JudgeMaster } from './judges_master.entity';

@Entity('posters')
export class Poster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event)
  event_id: Event;

  @Column()
  title: string;

  @Column({ type: 'text' })
  abstract: string;

  @ManyToOne(() => JudgeMaster)
  advisor_id: JudgeMaster;

  @Column()
  program: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
