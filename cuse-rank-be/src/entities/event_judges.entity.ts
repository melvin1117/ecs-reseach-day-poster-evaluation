import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Event } from './events.entity';
import { JudgeMaster } from './judges_master.entity';

@Entity('event_judges')
export class EventJudge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event)
  event_id: Event;

  @ManyToOne(() => JudgeMaster)
  judge_id: JudgeMaster;

  @Column()
  availability: string;

  @Column({ unique: true })
  unique_code: string;
}
