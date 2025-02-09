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


  async getUserEvents(authHeader: string, eventId?: string) {
    const decodedUser = await this.verifyToken(authHeader);
    const { id, role } = decodedUser;
  
    // If an eventId query parameter is provided, return details for that event only
    if (eventId) {
      if (role === 'admin') {
        // Admins can view any event by eventId
        const event = await this.eventsRepo
          .createQueryBuilder('event')
          .leftJoinAndSelect('event.created_by', 'user') // Join with creator details
          .where('event.id = :eventId', { eventId })
          .select([
            'event.id', 'event.name', 'event.description',
            'event.start_date', 'event.end_date',
            'event.judging_start_time', 'event.judging_end_time',
            'event.min_posters_per_judge', 'event.max_posters_per_judge',
            'event.judges_per_poster', 'event.criteria',
            'event.created_at', 'event.updated_at',
            'user.id', 'user.name', 'user.email'
          ])
          .getOne();
  
        if (!event) {
          throw new NotFoundException('Event not found');
        }
        return { message: 'Event retrieved successfully', event };
  
      } else if (role === 'organizer') {
        // Organizers must be associated with the event to view its details
        const organizerRecord = await this.organizersRepo.findOne({
          where: { 
            user_id: { id },
            event_id: { id: eventId } // Convert eventId to number if needed
          },
          relations: ['event_id']
        });
  
        if (!organizerRecord) {
          throw new UnauthorizedException('You are not an organizer for this event');
        }
  
        // Return the full event details (you can adjust the fields as necessary)
        const event = await this.eventsRepo
          .createQueryBuilder('event')
          .leftJoinAndSelect('event.created_by', 'user')
          .where('event.id = :eventId', { eventId })
          .select([
            'event.id', 'event.name', 'event.description',
            'event.start_date', 'event.end_date',
            'event.judging_start_time', 'event.judging_end_time',
            'event.min_posters_per_judge', 'event.max_posters_per_judge',
            'event.judges_per_poster', 'event.criteria',
            'event.created_at', 'event.updated_at',
            'user.id', 'user.name', 'user.email'
          ])
          .getOne();
  
        if (!event) {
          throw new NotFoundException('Event not found');
        }
        return { message: 'Event retrieved successfully', event };
  
      } else {
        throw new UnauthorizedException('You do not have permission to view this event');
      }
    }
  
    // If no eventId is provided, fetch events based on the user's role
    let events;
    if (role === 'admin') {
      // Admin: Fetch all events with creator details
      events = await this.eventsRepo
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.created_by', 'user')
        .select([
          'event.id', 'event.name', 'event.description',
          'event.start_date', 'event.end_date',
          'event.judging_start_time', 'event.judging_end_time',
          'event.min_posters_per_judge', 'event.max_posters_per_judge',
          'event.judges_per_poster', 'event.criteria',
          'event.created_at', 'event.updated_at',
          'user.id', 'user.name', 'user.email'
        ])
        .getMany();
  
    } else if (role === 'organizer') {
      // Organizer: First, find events where the user is an organizer
      const organizerEvents = await this.organizersRepo.find({
        where: { user_id: { id } },
        relations: ['event_id'] // Loads the entire Event entity
      });
      const eventIds = organizerEvents.map(org => org.event_id.id);
  
      events = await this.eventsRepo
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.created_by', 'user')
        .where('event.id IN (:...eventIds)', { eventIds })
        .select([
          'event.id', 'event.name', 'event.description',
          'event.start_date', 'event.end_date',
          'event.judging_start_time', 'event.judging_end_time',
          'event.min_posters_per_judge', 'event.max_posters_per_judge',
          'event.judges_per_poster', 'event.criteria',
          'event.created_at', 'event.updated_at',
          'user.id', 'user.name', 'user.email'
        ])
        .getMany();
  
    } else {
      throw new UnauthorizedException('You do not have permission to view events');
    }
  
    if (!events || !events.length) {
      throw new NotFoundException('No events found for this user');
    }
  
    return { message: 'Events retrieved successfully', events };
  }

  async createEvent(authHeader: string, eventData: any) {
    // Verify token and fetch the user who is creating the event
    const decodedUser = await this.verifyToken(authHeader);
    const user = await this.usersRepo.findOne({ where: { id: decodedUser.id } });
    if (!user) throw new UnauthorizedException('User not found');
  
    // Create a new event using data from eventData
    const newEvent = this.eventsRepo.create({
      name: eventData.name,
      description: eventData.description,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      judging_start_time: eventData.judging_start_time,
      judging_end_time: eventData.judging_end_time,
      min_posters_per_judge: eventData.min_posters_per_judge,
      max_posters_per_judge: eventData.max_posters_per_judge,
      judges_per_poster: eventData.judges_per_poster,
      created_by: user,
      criteria: eventData.criteria,
    });
  
    await this.eventsRepo.save(newEvent);
  
    // Prepare the list of organizer IDs.
    // If eventData.organizersId is provided and is an array, use it; otherwise, start with an empty array.
    const organizerIds: string[] = Array.isArray(eventData.organizersId)
      ? [...eventData.organizersId]
      : [];
  
    // Ensure the event creator is always an organizer.
    if (!organizerIds.includes(user.id)) {
      organizerIds.push(user.id);
    }
  
    // For each organizer ID, check if an organizer record already exists for the new event.
    // If it doesn't, create a new organizer record.
    const organizerPromises = organizerIds.map(async (organizerId) => {
      const existingOrganizer = await this.organizersRepo.findOne({
        where: { user_id: { id: organizerId }, event_id: { id: newEvent.id } },
      });
  
      if (!existingOrganizer) {
        return this.organizersRepo.save({
          user_id: { id: organizerId },
          event_id: { id: newEvent.id },
        });
      }
    });
  
    await Promise.all(organizerPromises);
  
    return { message: 'Event created successfully and organizers assigned', event: newEvent };
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

  /* get all organisers*/
  async getAllOrganizers(authHeader: string) {
    // Verify JWT token
    const decodedUser = await this.verifyToken(authHeader);

    // Ensure user exists in the database
    const user = await this.usersRepo.findOne({ where: { id: decodedUser.id } });
    if (!user) throw new UnauthorizedException('User not found');

    // Fetch all users where role = 'organizer'
    const organizers = await this.usersRepo.find({
      where: { role: 'organizer' },
      select: ['id', 'name', 'email'], // Only return required fields
    });

    if (!organizers.length) {
      throw new NotFoundException('No organizers found');
    }

    return { message: 'Organizers retrieved successfully', organizers };
  }

  async getOrganizersByEvent(eventId: string) {
    return this.organizersRepo
      .createQueryBuilder('organizer')
      .innerJoinAndSelect('users', 'user', 'user.id = organizer.user_id')
      .where('organizer.event_id = :eventId', { eventId })
      .select([
        'organizer.id',
        'user.id AS user_id',
        'user.name',
        'user.email',
        'user.role',
        'user.created_at',
      ])
      .getRawMany();
  }

}
