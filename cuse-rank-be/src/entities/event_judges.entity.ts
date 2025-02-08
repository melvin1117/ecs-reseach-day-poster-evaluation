import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './events.entity';
import { JudgeMaster } from './judges_master.entity';

@Entity('event_judges')
export class EventJudge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event_id: Event;

  @ManyToOne(() => JudgeMaster)
  @JoinColumn({ name: 'judge_id' })
  judge_id: JudgeMaster;

  @Column()
  availability: string;

  @Column({ unique: true })
  unique_code: string;
}
