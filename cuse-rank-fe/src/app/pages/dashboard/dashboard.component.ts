import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  events: Event[] = [];
  ongoingEvents: Event[] = [];
  upcomingEvents: Event[] = [];
  pastEvents: Event[] = [];
  loading = false;
  error: string | null = null;

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.loading = true;
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.categorizeEvents();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load events.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  private categorizeEvents(): void {
    const now = new Date();
    this.ongoingEvents = [];
    this.upcomingEvents = [];
    this.pastEvents = [];
    this.events.forEach(event => {
      const start = new Date(event.start_date);
      const end = new Date(event.end_date);
      if (start <= now && now <= end) {
        this.ongoingEvents.push(event);
      } else if (start > now) {
        this.upcomingEvents.push(event);
      } else if (end < now) {
        this.pastEvents.push(event);
      }
    });
  }

  viewEventDetails(event: Event): void {
    this.router.navigate(['/events', event.id]);
  }
}
