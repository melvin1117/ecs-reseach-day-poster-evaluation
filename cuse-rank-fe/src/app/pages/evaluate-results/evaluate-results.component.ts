import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationService } from '../../services/evaluation.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { EvaluationResponse } from '../../models/evaluation.model';

@Component({
  selector: 'app-evaluate-results',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatChipsModule],
  templateUrl: './evaluate-results.component.html',
  styleUrls: ['./evaluate-results.component.scss']
})
export class EvaluateResultsComponent implements OnInit {
  evaluationResponse: EvaluationResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(private evalService: EvaluationService, private router: Router) {}

  ngOnInit(): void {
    // Check that the evaluation session is available (the guard should have already checked this)
    if (!this.evalService.assignedPosters) {
      this.router.navigate(['/evaluate']);
      return;
    }
    // Now using the new structure
    this.evaluationResponse = this.evalService.assignedPosters;
  }

  logout(): void {
    this.evalService.logout();
    this.router.navigate(['/evaluate']);
  }
}
