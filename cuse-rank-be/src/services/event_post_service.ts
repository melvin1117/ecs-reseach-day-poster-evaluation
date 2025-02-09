import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/events.entity';
import { User } from '../entities/users.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async verifyToken(authHeader: string): Promise<JwtPayload> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization token not provided or invalid',
      );
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token);
      const currentTimestamp = Math.floor(Date.now() / 1000); 
      if (decoded.exp && decoded.exp < currentTimestamp) {
        throw new UnauthorizedException('Token has expired');
      }
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async createEvent(
    authHeader: string,
    eventData: {
      name: string;
      description: string;
      start_date: Date;
      end_date: Date;
      judging_start_time: Date;
      judging_end_time: Date;
      criteria: object;
    },
  ) {
    const decodedUser = await this.verifyToken(authHeader);
    if (!decodedUser) {
      throw new UnauthorizedException('Unauthorized user');
    }

    const user = await this.usersRepo.findOne({
      where: { id: decodedUser.id },
    });
    if (!user) throw new UnauthorizedException('User not found');

    const newEvent = this.eventsRepo.create({
      name: eventData.name,
      description: eventData.description,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      judging_start_time: eventData.judging_start_time,
      judging_end_time: eventData.judging_end_time,
      created_by: user,
      criteria: eventData.criteria,
    });
    await this.eventsRepo.save(newEvent);
    return { message: 'Event created successfully', event: newEvent };
  }
}
