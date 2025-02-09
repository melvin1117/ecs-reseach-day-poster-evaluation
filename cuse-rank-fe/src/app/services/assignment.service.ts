import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssignmentResponse } from '../models/assignment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getAssignmentsByEvent(eventId: string): Observable<AssignmentResponse> {
    return this.http.get<AssignmentResponse>(`${this.apiUrl}/assignments?event_id=${eventId}`);
  }
}
