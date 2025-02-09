import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EventDetailsComponent } from './pages/event-detail/event-detail.component';
import { EventFormComponent } from './pages/event-form/event-form.component';
import { EvaluateComponent } from './pages/evaluate/evaluate.component';
import { EvaluateResultsComponent } from './pages/evaluate-results/evaluate-results.component';
import { AuthGuard } from './guards/auth.guard';
import { EvaluateGuard } from './guards/evaluate.guard';

export const routes: Route[] = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'events/create', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events/:id/edit', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events/:id', component: EventDetailsComponent, canActivate: [AuthGuard] },
  { path: 'evaluate', component: EvaluateComponent },
  { path: 'evaluate/results', component: EvaluateResultsComponent, canActivate: [EvaluateGuard] },
  // Additional evaluation routes if needed.
  { path: '**', redirectTo: '' }
];
