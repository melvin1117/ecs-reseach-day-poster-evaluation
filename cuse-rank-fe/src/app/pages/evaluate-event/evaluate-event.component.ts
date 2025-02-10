import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationService } from '../../services/evaluation.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { EvaluationResponse } from '../../models/evaluation.model';

@Component({
  selector: 'app-evaluate-event',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatChipsModule],
  templateUrl: './evaluate-event.component.html',
  styleUrls: ['./evaluate-event.component.scss']
})
export class EvaluateEventComponent implements OnInit {
  evaluationResponse: EvaluationResponse | null = null;
  loading = false;
  error: string | null = null;
  
  // This object maps a unique key (groupKey_index) to a boolean indicating if that poster is expanded.
  expandedMap: { [key: string]: boolean } = {};

  constructor(private evalService: EvaluationService, private router: Router) {}

  ngOnInit(): void {
    if (!this.evalService.assignedPosters) {
      this.router.navigate(['/evaluate']);
      return;
    }
    this.evaluationResponse = this.evalService.assignedPosters;
  }

  /**
   * Called when a card is clicked (outside of the read-more link).
   * You can create an event here—for example, navigate to a details page or emit an event.
   */
  onPosterCardClick(poster: any): void {
    this.router.navigate(['/evaluate/event/poster', poster.id]);
  }

  /**
   * Toggles the expansion of the poster abstract.
   * The event is stopped from propagating so that clicking "Read more" does not trigger the card click.
   */
  toggleAbstract(event: Event, groupKey: string, index: number): void {
    event.stopPropagation();
    const key = `${groupKey}_${index}`;
    this.expandedMap[key] = !this.expandedMap[key];
  }

  /**
   * Returns true if the abstract for this poster should be fully displayed.
   */
  isExpanded(groupKey: string, index: number): boolean {
    const key = `${groupKey}_${index}`;
    return this.expandedMap[key];
  }

  logout(): void {
    this.evalService.logout();
    this.router.navigate(['/evaluate']);
  }
}
