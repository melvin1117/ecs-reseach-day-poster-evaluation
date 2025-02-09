import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  loading = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private eventService: EventService) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loading = true;
      this.eventService.getEventById(eventId).subscribe({
        next: (event) => {
          this.event = event;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load event details.';
          console.error(err);
          this.loading = false;
        }
      });
    }
  }
}
