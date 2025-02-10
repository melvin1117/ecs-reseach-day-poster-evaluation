// evaluate-redirect.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { EvaluationService } from '../services/evaluation.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluateRedirectGuard implements CanActivate {
  constructor(
    private evalService: EvaluationService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Ensure that if the service's in-memory value is null,
    // we try to load from localStorage.
    if (!this.evalService.assignedPosters) {
      this.evalService.loadFromStorage();
    }

    if (this.evalService.assignedPosters) {
      // If we have the evaluation session, redirect to the event page.
      this.router.navigate(['/evaluate/event']);
      return false;
    }

    // Otherwise, allow the /evaluate route.
    return true;
  }
}
