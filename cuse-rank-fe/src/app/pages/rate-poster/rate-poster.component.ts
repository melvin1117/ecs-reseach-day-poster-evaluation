import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EvaluationService } from '../../services/evaluation.service';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-rate-poster',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './rate-poster.component.html',
  styleUrls: ['./rate-poster.component.scss']
})
export class RatePosterComponent implements OnInit {
  poster: any; // The poster to be rated
  ratingForm!: FormGroup;
  criteria: { [key: string]: number } = {};
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evalService: EvaluationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Extract the poster id from the URL
    const posterId = this.route.snapshot.paramMap.get('posterId');
    if (!this.evalService.assignedPosters) {
      // If there is no evaluation session, send the user back to /evaluate
      this.router.navigate(['/evaluate']);
      return;
    }

    // Find the poster from the groups in assignedPosters
    let found = false;
    for (const groupKey in this.evalService.assignedPosters.posters) {
      const groupPosters = this.evalService.assignedPosters.posters[groupKey];
      // Assumption: each poster object has an "id" property
      this.poster = groupPosters.find((p: any) => p.id === posterId);
      if (this.poster) {
        found = true;
        break;
      }
    }
    if (!found) {
      this.error = 'Poster not found';
      return;
    }

    // Get the criteria from the event property (if available)
    if (this.evalService.assignedPosters.event && this.evalService.assignedPosters.event.criteria) {
      this.criteria = this.evalService.assignedPosters.event.criteria;
    }

    // Build the reactive form. For each criterion, add a number field.
    // The number must be between 0 and 10 and allows up to 2 decimal places.
    const numberPattern = /^(10(\.0{1,2})?|[0-9](\.[0-9]{1,2})?)$/;
    const formControls: { [key: string]: FormControl } = {};
    Object.keys(this.criteria).forEach(key => {
      formControls[key] = new FormControl(null, [
        Validators.required,
        Validators.min(0),
        Validators.max(10),
        Validators.pattern(numberPattern)
      ]);
    });
    // Add a control for the comment
    formControls['comment'] = new FormControl('');

    this.ratingForm = this.fb.group(formControls);
  }

  submitRating(): void {
    if (this.ratingForm.invalid) {
      return;
    }
    const ratingData = this.ratingForm.value;
    console.log('Submitting rating for poster', this.poster, ratingData);
    // TODO: Call your service to submit the rating, e.g.,
    // this.evalService.submitRating(this.poster.id, ratingData).subscribe(...);
  }
}
