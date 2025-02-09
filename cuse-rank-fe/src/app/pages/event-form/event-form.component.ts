import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Organizer } from '../../models/organizer.model';
import { environment } from '../../../environments/environment';
import { Event } from '../../models/event.model';

/**
 * Validator for the criteria FormArray.
 * Ensures that the sum of all criteria weights equals 1.
 */
function criteriaSumValidator(control: AbstractControl): ValidationErrors | null {
  const criteriaArray = control as FormArray;
  const sum = criteriaArray.controls.reduce((acc, curr) => {
    const weight = Number(curr.get('weight')?.value);
    return acc + (isNaN(weight) ? 0 : weight);
  }, 0);
  return Math.abs(sum - 1) > 0.001 ? { criteriaSumNotOne: true } : null;
}

/**
 * Validator for event dates.
 * Validates that:
 * - start_date is today or in the future,
 * - end_date is after start_date,
 * - judging_start_time is after start_date,
 * - judging_end_time is after judging_start_time and before end_date.
 */
function eventDatesValidator(group: AbstractControl): ValidationErrors | null {
  const start_date = group.get('start_date')?.value;
  const end_date = group.get('end_date')?.value;
  const judging_start_time = group.get('judging_start_time')?.value;
  const judging_end_time = group.get('judging_end_time')?.value;

  const errors: any = {};
  const now = new Date();

  if (start_date) {
    const startDate = new Date(start_date);
    const today = new Date(now.toDateString());
    if (startDate < today) {
      errors['startDateInvalid'] = 'Start date must be today or in the future.';
    }
  }
  if (start_date && end_date) {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (endDate <= startDate) {
      errors['endDateInvalid'] = 'End date must be after start date.';
    }
  }
  if (start_date && judging_start_time) {
    const startDate = new Date(start_date);
    const judgingStart = new Date(judging_start_time);
    if (judgingStart < startDate) {
      errors['judgingStartInvalid'] = 'Judging start time must be after start date.';
    }
  }
  if (judging_start_time && judging_end_time) {
    const judgingStart = new Date(judging_start_time);
    const judgingEnd = new Date(judging_end_time);
    if (judgingEnd <= judgingStart) {
      errors['judgingEndInvalid'] = 'Judging end time must be after judging start time.';
    }
  }
  if (judging_end_time && end_date) {
    const judgingEnd = new Date(judging_end_time);
    const endDate = new Date(end_date);
    if (judgingEnd > endDate) {
      errors['judgingEndAfterEndDate'] = 'Judging end time must be before event end date.';
    }
  }
  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {
  eventForm!: FormGroup;
  organizers: Organizer[] = [];
  defaultCriteria = [
    { name: 'Innovation', weight: 0.30 },
    { name: 'Clarity', weight: 0.25 },
    { name: 'Impact', weight: 0.25 },
    { name: 'User Experience', weight: 0.05 },
    { name: 'Technical Merit', weight: 0.15 }
  ];

  isEditMode = false;
  eventId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadOrganizers();

    // Check if an event id is present in the route (edit mode).
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.isEditMode = true;
      this.loadEventDetails(this.eventId);
    }
  }

  initializeForm(): void {
    this.eventForm = this.fb.group(
      {
        name: ['', Validators.required],
        description: [''],
        start_date: ['', Validators.required],
        end_date: ['', Validators.required],
        judging_start_time: ['', Validators.required],
        judging_end_time: ['', Validators.required],
        min_posters_per_judge: [2, [Validators.required, Validators.min(1)]],
        max_posters_per_judge: [6, [Validators.required, Validators.min(1)]],
        judges_per_poster: [2, [Validators.required, Validators.min(1)]],
        organizersId: [[], Validators.required],
        criteria: this.fb.array([], criteriaSumValidator)
      },
      { validators: eventDatesValidator }
    );

    // Initialize criteria FormArray with default values if empty.
    const criteriaArray = this.eventForm.get('criteria') as FormArray;
    if (criteriaArray.length === 0) {
      this.defaultCriteria.forEach(item => {
        criteriaArray.push(
          this.fb.group({
            name: [item.name, Validators.required],
            weight: [item.weight, [Validators.required, Validators.min(0)]]
          })
        );
      });
    }
  }

  // Load organizers using the EventService.
  loadOrganizers(): void {
    this.eventService.getOrganizers().subscribe({
      next: (data) => {
        this.organizers = data.organizers;
      },
      error: (err) => {
        console.error('Failed to load organizers:', err);
      }
    });
  }

  // In edit mode, load event details from the API and patch the form.
  loadEventDetails(eventId: string): void {
    this.eventService.getEventById(eventId).subscribe({
      next: (eventD: { message: string, event: Event}) => {
        // Patch main form fields.
        const eventData = eventD.event;
        this.eventForm.patchValue({
          name: eventData.name,
          description: eventData.description,
          // For date inputs, convert to the proper string format for datetime-local.
          start_date: this.formatDateForInput(eventData.start_date),
          end_date: this.formatDateForInput(eventData.end_date),
          judging_start_time: this.formatDateForInput(eventData.judging_start_time),
          judging_end_time: this.formatDateForInput(eventData.judging_end_time),
          min_posters_per_judge: eventData.min_posters_per_judge,
          max_posters_per_judge: eventData.max_posters_per_judge,
          judges_per_poster: eventData.judges_per_poster,
          organizersId: eventData.organizersId || []
        });
        // Replace the criteria FormArray with the event's criteria.
        const criteriaArray = this.eventForm.get('criteria') as FormArray;
        while (criteriaArray.length) {
          criteriaArray.removeAt(0);
        }
        if (eventData.criteria && eventData.criteria.length) {
          eventData.criteria.forEach(crit => {
            criteriaArray.push(
              this.fb.group({
                name: [crit.name, Validators.required],
                weight: [crit.weight, [Validators.required, Validators.min(0)]]
              })
            );
          });
        }
      },
      error: (err) => {
        console.error('Failed to load event details:', err);
      }
    });
  }

  /**
   * Helper function to format a date string (or Date object) to the required format
   * for an <input type="datetime-local">.
   */
  formatDateForInput(dateStr: string): string {
    const date = new Date(dateStr);
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const HH = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${yyyy}-${MM}-${dd}T${HH}:${mm}`;
  }

  get criteriaControls() {
    return (this.eventForm.get('criteria') as FormArray).controls;
  }

  addCriteria(): void {
    const criteriaArray = this.eventForm.get('criteria') as FormArray;
    criteriaArray.push(
      this.fb.group({
        name: ['', Validators.required],
        weight: [0, [Validators.required, Validators.min(0)]]
      })
    );
  }

  removeCriteria(index: number): void {
    const criteriaArray = this.eventForm.get('criteria') as FormArray;
    if (criteriaArray.length > 1) {
      criteriaArray.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const eventData = this.eventForm.value;
      if (this.isEditMode && this.eventId) {
        // Update event using the service.
        this.eventService.updateEvent(this.eventId, eventData).subscribe({
          next: (res) => {
            console.log('Event updated successfully', res);
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Failed to update event', err);
          }
        });
      } else {
        // Create a new event.
        this.eventService.createEvent(eventData).subscribe({
          next: (res) => {
            console.log('Event created successfully', res);
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Failed to create event', err);
          }
        });
      }
    } else {
      console.log('Form is invalid', this.eventForm.errors);
    }
  }
}
