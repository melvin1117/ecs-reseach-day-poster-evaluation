import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('judges_master')
export class JudgeMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  department: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  degree: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ nullable: true })
  profile_img: string;

  @CreateDateColumn({ type: 'timestamp' })
  last_updated: Date;
}
