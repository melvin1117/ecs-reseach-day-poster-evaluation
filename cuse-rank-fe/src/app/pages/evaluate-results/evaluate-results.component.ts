import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationService } from '../../services/evaluation.service';
import { EvaluationResponse } from '../../models/evaluation.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';

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
    // Ensure that the evaluation session is available (the guard should have already checked this)
    if (!this.evalService.assignedPosters) {
      this.router.navigate(['/evaluate']);
      return;
    }
    this.evaluationResponse = this.evalService.assignedPosters;
  }

  logout(): void {
    this.evalService.logout();
    this.router.navigate(['/evaluate']);
  }
}
