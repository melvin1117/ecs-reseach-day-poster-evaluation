import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { EvaluationService } from '../../services/evaluation.service';

@Component({
  selector: 'app-evaluate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './evaluate.component.html',
  styleUrls: ['./evaluate.component.scss']
})
export class EvaluateComponent {
  evalForm: FormGroup;
  error: string | null = null;

  constructor(private fb: FormBuilder, private evalService: EvaluationService, private router: Router) {
    this.evalForm = this.fb.group({
      uniqueCode: ['', Validators.required],
      netid: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.evalForm.valid) {
      const { uniqueCode, netid } = this.evalForm.value;
      this.evalService.getAssignedPosters(netid, uniqueCode).subscribe({
        next: (response) => {
          // Evaluation session is now stored.
          this.router.navigate(['/evaluate/results']);
        },
        error: (err) => {
          console.error('Evaluation login failed', err);
          this.error = 'Invalid unique code or NetID.';
        }
      });
    }
  }
}
