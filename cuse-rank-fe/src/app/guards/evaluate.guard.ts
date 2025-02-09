import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { EvaluationService } from '../services/evaluation.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluateGuard implements CanActivate {
  constructor(private evalService: EvaluationService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.evalService.assignedPosters) {
      return true;
    }
    return this.router.parseUrl('/evaluate');
  }
}
