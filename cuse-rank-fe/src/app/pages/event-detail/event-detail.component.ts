import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AssignmentService } from '../../services/assignment.service';
import { UploadService } from '../../services/upload.service';
import { Event } from '../../models/event.model';
import { AssignmentResponse } from '../../models/assignment.model';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatChipsModule, MatIconModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailsComponent implements OnInit {
  event: Event | null = null;
  assignments: AssignmentResponse | null = null;
  loading = false;
  error: string | null = null;
  
  // Toggle for showing unique codes in assignments.
  showUniqueCodes = false;
  
  // File upload variables.
  judgesFile: File | null = null;
  postersFile: File | null = null;
  uploadMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private assignmentService: AssignmentService,
    private uploadService: UploadService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loading = true;
      this.eventService.getEventById(eventId).subscribe({
        next: (response) => {
          // Assuming the response structure: { message: string, event: Event }
          this.event = response.event;
          this.loadAssignments(eventId);
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

  loadAssignments(eventId: string): void {
    this.assignmentService.getAssignmentsByEvent(eventId).subscribe({
      next: (response) => {
        this.assignments = response;
      },
      error: (err) => {
        console.error('Failed to load assignments:', err);
        this.assignments = null;
      }
    });
  }

  isOwner(): boolean {
    const currentUser = this.authService.currentUser;
    return (
      currentUser &&
      this.event &&
      this.event.created_by &&
      currentUser.email === this.event.created_by.email
    );
  }

  editEvent(): void {
    if (this.event) {
      this.router.navigate(['/events', this.event.id, 'edit']);
    }
  }

  isUpcoming(): boolean {
    if (this.event && this.event.start_date) {
      return new Date(this.event.start_date) > new Date();
    }
    return false;
  }

  // File upload methods for judges mapping.
  onJudgesFileSelected(e: any): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.judgesFile = input.files[0];
    }
  }

  uploadJudgesFile(): void {
    if (this.judgesFile && this.event) {
      this.uploadService.uploadJudges(this.event.id, this.judgesFile).subscribe({
        next: () => {
          this.uploadMessage = 'Judges file uploaded successfully.';
        },
        error: (err) => {
          console.error(err);
          this.uploadMessage = 'Failed to upload judges file.';
        }
      });
    }
  }

  // File upload methods for posters mapping.
  onPostersFileSelected(e: any): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.postersFile = input.files[0];
    }
  }

  uploadPostersFile(): void {
    if (this.postersFile && this.event) {
      this.uploadService.uploadPosters(this.event.id, this.postersFile).subscribe({
        next: () => {
          this.uploadMessage = 'Posters file uploaded successfully.';
        },
        error: (err) => {
          console.error(err);
          this.uploadMessage = 'Failed to upload posters file.';
        }
      });
    }
  }

  toggleUniqueCodes(): void {
    this.showUniqueCodes = !this.showUniqueCodes;
  }
}
