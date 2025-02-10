import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import readXlsxFile from 'read-excel-file/node';
import { JudgeMaster } from '../entities/judges_master.entity';
import { EventJudge } from '../entities/event_judges.entity';
import { Poster } from '../entities/posters.entity';
import { Event } from '../entities/events.entity';
import { Like } from 'typeorm';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(JudgeMaster)
    private judgesMasterRepo: Repository<JudgeMaster>,
    @InjectRepository(EventJudge)
    private eventJudgesRepo: Repository<EventJudge>,
    @InjectRepository(Poster)
    private postersRepo: Repository<Poster>,
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,
  ) {}

  async processJudgesData(filePath: string, eventId: string) {
    const event = await this.eventsRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event with ID ${eventId} not found');
    }

    const judgesData = await readXlsxFile(filePath);
    judgesData.shift();

    for (const row of judgesData) {
      const firstName = String(row[1]).trim();
      const lastName = String(row[2]).trim();
      const department = String(row[3]).trim();
      const availability = String(row[4]).trim();

      if (
        firstName !== '' &&
        lastName !== '' &&
        department !== '' &&
        availability !== ''
      ) {
        //const name = ${firstName} ${lastName};

        //let judge = await this.judgesMasterRepo.findOne({ where: { name } });

        const judge = await this.judgesMasterRepo.findOne({
          where: { name: Like(`%${firstName}%${lastName}%`) },
        });

        // if (judge) {
        //   await this.judgesMasterRepo.update(judge.id, { department }); // Update department if found
        //   await this.judgesMasterRepo.save(judge);
        // }

        const existingEventJudge = await this.eventJudgesRepo.findOne({
          where: { event_id: event, judge_id: judge },
        });

        if (!existingEventJudge) {
          await this.eventJudgesRepo.insert({
            unique_code: Math.floor(100000 + Math.random() * 900000).toString(),
            event_id: event,
            judge_id: judge,
            availability: availability,
          });
        }
      }
    }

    return { message: 'Judges data updated successfully' };
  }

  async processPostersData(filePath: string, eventId: string) {
    const event = await this.eventsRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event with ID ${eventId} not found');
    }

    const postersData = await readXlsxFile(filePath);
    const headers = postersData.shift(); // Extract column names

    // Find the index of 'Poster #' column dynamically
    const posterNumIndex = headers.findIndex((col) =>
      col.toString().toLowerCase().includes('poster #'),
    );

    if (posterNumIndex === -1) {
      throw new Error("Column 'Poster #' not found in the uploaded file.");
    }

    let validPosterNumber = 1; // Track sequential numbering while ignoring null rows

    for (const row of postersData) {
      // Skip completely empty rows
      if (row.every((cell) => cell === null || cell === '')) {
        continue;
      }

      // Extract Poster #
      const rawSerial = row[posterNumIndex];
      if (rawSerial == null || rawSerial === '') {
        continue; // Ignore rows without a Poster # value
      }

      // Assign a sequential number manually to maintain order
      const serialNumber = validPosterNumber;
      validPosterNumber++; // Increment only for valid posters

      const slots = serialNumber % 2 === 0 ? 2 : 1; // Even = 2 slots, Odd = 1 slot

      // Extract other poster details
      const title = String(row[1] ?? '').trim();
      const abstract = String(row[2] ?? '').trim();
      const program = String(row[5] ?? '').trim();
      const advisorFirstName = String(row[3] ?? '').trim();
      const advisorLastName = String(row[4] ?? '').trim();

        const advisor = await this.judgesMasterRepo.findOne({
          where: { name: Like(`%${advisorFirstName}%${advisorLastName}%`) },
        });

      if (!advisor) {
        console.warn(
          `Warning: Advisor '${advisorFirstName} ${advisorLastName}' not found, setting advisor_id to NULL`,
        );
      }

      // Insert poster with calculated slots
      await this.postersRepo.insert({
        created_at: new Date(),
        event_id: event,
        title,
        abstract,
        program,
        advisor_id: advisor ? advisor : null,
        slots, // Assign slots dynamically
      });
    }

    return { message: 'Posters data uploaded successfully' };
  }
}