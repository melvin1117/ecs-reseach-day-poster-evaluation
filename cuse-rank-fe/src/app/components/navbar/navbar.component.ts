import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EvaluationService } from '../../services/evaluation.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    public evalService: EvaluationService,
    public router: Router
  ) {}

  onLogin(): void {
    this.router.navigate(['/login']);
  }

  onAuthLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onEvalLogout(): void {
    this.evalService.logout();
    this.router.navigate(['/evaluate']);
  }

  // Returns true if the current URL begins with '/evaluate'
  isEvaluationRoute(): boolean {
    return this.router.url.startsWith('/evaluate');
  }
}
