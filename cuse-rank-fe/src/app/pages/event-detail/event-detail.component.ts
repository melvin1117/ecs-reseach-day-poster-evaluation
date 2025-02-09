import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatChipsModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailsComponent implements OnInit {
  event: Event | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loading = true;
      this.eventService.getEventById(eventId).subscribe({
        next: (event) => {
          this.event = event.event;
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

  /**
   * Returns true if the currently logged in user's id matches
   * the event creator's id.
   */
  isOwner(): boolean {
    const currentUser = this.authService.currentUser;
    return (
      currentUser?.email &&
      this.event?.created_by?.email &&
      currentUser.email === this.event.created_by.email
    );
  }

  /**
   * Navigate to the edit page for the current event.
   */
  editEvent(): void {
    if (this.event) {
      this.router.navigate(['/events', this.event.id, 'edit']);
    }
  }
}
