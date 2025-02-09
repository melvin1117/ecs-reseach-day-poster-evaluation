import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/events.entity';
import { User } from '../entities/users.entity';
import { Organizer } from '../entities/organizers.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(Organizer)
    private organizersRepo: Repository<Organizer>,

    private jwtService: JwtService,
  ) { }

  async verifyToken(authHeader: string): Promise<{ id: string; email: string; role: string }> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token not provided or invalid');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token);
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (decoded.exp && decoded.exp < currentTimestamp) {
        throw new UnauthorizedException('Token has expired');
      }
      // Extract user email from token
      const user = await this.usersRepo.findOne({ where: { email: decoded.email } });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return { id: user.id, email: user.email, role: user.role };

    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }


  async getUserEvents(authHeader: string) {
    const decodedUser = await this.verifyToken(authHeader);
    const { id, role } = decodedUser;

    let events;

    if (role === 'admin') {
      // Fetch all events with creator details
      events = await this.eventsRepo
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.created_by', 'user') // Join with users table
        .select([
          'event.id', 'event.name', 'event.description',
          'event.start_date', 'event.end_date',
          'event.judging_start_time', 'event.judging_end_time',
          'event.min_posters_per_judge', 'event.max_posters_per_judge',
          'event.judges_per_poster', 'event.criteria',
          'event.created_at', 'event.updated_at',
          'user.id', 'user.name', 'user.email' // Include creator's name and email
        ])
        .getMany();
    } else if (role === 'organizer') {
      // Fetch only events where the user is an organizer
      const organizerEvents = await this.organizersRepo.find({ where: { user_id: {id} } });
      const eventIds = organizerEvents.map(org => org.event_id);

      events = await this.eventsRepo
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.created_by', 'user') // Join with users table
        .where('event.id IN (:...eventIds)', { eventIds })
        .select([
          'event.id', 'event.name', 'event.description',
          'event.start_date', 'event.end_date',
          'event.judging_start_time', 'event.judging_end_time',
          'event.min_posters_per_judge', 'event.max_posters_per_judge',
          'event.judges_per_poster', 'event.criteria',
          'event.created_at', 'event.updated_at',
          'user.id', 'user.name', 'user.email' // Include creator's name and email
        ])
        .getMany();
    } else {
      throw new UnauthorizedException('You do not have permission to view events');
    }

    if (!events.length) {
      throw new NotFoundException('No events found for this user');
    }

    return { message: 'Events retrieved successfully', events };
  }


  // async getUserEvents(authHeader: string) {
  //   const decodedUser = await this.verifyToken(authHeader);
  //   const { id, role } = decodedUser;

  //   let events;

  //   if (role === 'admin') {
  //       // Fetch all events if the user is an admin
  //       events = await this.eventsRepo.find();
  //   } else if (role === 'organizer') {
  //       // Fetch events where the user is listed in the "organizers" table
  //       const organizerEvents = await this.organizersRepo.find({ where: { user_id: {id} } });
  //       const eventIds = organizerEvents.map(org => org.event_id);
  //       events = await this.eventsRepo.findByIds(eventIds);
  //   } else {
  //       throw new UnauthorizedException('You do not have permission to view events');
  //   }

  //   if (!events.length) {
  //       throw new NotFoundException('No events found for this user');
  //   }

  //   return { message: 'Events retrieved successfully', events };
  // }


  async createEvent(authHeader: string, eventData: any) {
    const decodedUser = await this.verifyToken(authHeader);
    const user = await this.usersRepo.findOne({ where: { id: decodedUser.id } });
    if (!user) throw new UnauthorizedException('User not found');

    const newEvent = this.eventsRepo.create({ ...eventData, created_by: user });
    await this.eventsRepo.save(newEvent);
    return { message: 'Event created successfully', event: newEvent };
  }

  async updateEvent(authHeader: string, eventId: string, updateData: any) {
    const decodedUser = await this.verifyToken(authHeader);

    const event = await this.eventsRepo.findOne({ where: { id: eventId, created_by: { id: decodedUser.id } } });
    if (!event) throw new NotFoundException('Event not found or unauthorized');

    Object.assign(event, updateData);
    await this.eventsRepo.save(event);
    return { message: 'Event updated successfully', event };
  }

  /**
   * DELETE a specific event by event ID
   */
  async deleteEvent(authHeader: string, eventId: string) {
    const decodedUser = await this.verifyToken(authHeader);

    const event = await this.eventsRepo.findOne({ where: { id: eventId, created_by: { id: decodedUser.id } } });
    if (!event) throw new NotFoundException('Event not found or unauthorized');

    await this.eventsRepo.delete(eventId);
    return { message: 'Event deleted successfully' };
  }

  /**
   * DELETE all events of the authenticated user
   */
  async deleteAllEvents(authHeader: string) {
    const decodedUser = await this.verifyToken(authHeader);

    const user = await this.usersRepo.findOne({ where: { id: decodedUser.id } });
    if (!user) throw new UnauthorizedException('User not found');

    const events = await this.eventsRepo.find({ where: { created_by: user } });
    if (!events.length) throw new NotFoundException('No events found to delete');

    await this.eventsRepo.delete({ created_by: user });
    return { message: 'All events deleted successfully' };
  }
}
