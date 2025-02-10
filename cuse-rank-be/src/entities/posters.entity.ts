import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Event } from './events.entity';
import { JudgeMaster } from './judges_master.entity';

@Entity('posters')
export class Poster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event_id: Event;

  @Column()
  title: string;

  @Column({ type: 'text' })
  abstract: string;

  @ManyToOne(() => JudgeMaster)
  @JoinColumn({ name: 'advisor_id' })
  advisor_id: JudgeMaster;

  @Column()
  program: string;

  @Column({ type: 'int', nullable: false })
  slots: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
