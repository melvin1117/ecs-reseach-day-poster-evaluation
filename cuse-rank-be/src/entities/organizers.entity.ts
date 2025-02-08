import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './users.entity';
import { Event } from './events.entity';

@Entity('organizers')
export class Organizer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user_id: User;

  @ManyToOne(() => Event)
  event_id: Event;
}
