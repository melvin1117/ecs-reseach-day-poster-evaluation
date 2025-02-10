import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { EvaluationResponse } from '../models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = environment.apiBaseUrl;
  private storageKey = 'evalSession';

  // Holds the evaluation response (or remains null if not logged in for evaluation)
  public assignedPosters: EvaluationResponse | null = null;

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  getAssignedPosters(netid: string, uniqueCode: string): Observable<EvaluationResponse> {
    const params = new HttpParams()
      .set('netid', netid)
      .set('uniqueCode', uniqueCode);
  
    return this.http.get<EvaluationResponse>(`${this.apiUrl}/judges/assignments`, { params }).pipe(
      tap(response => {
        this.assignedPosters = response;
        localStorage.setItem(this.storageKey, JSON.stringify(response));
      })
    );
  }

  loadFromStorage(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.assignedPosters = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse evaluation session', e);
      }
    }
  }

  logout(): void {
    this.assignedPosters = null;
    localStorage.removeItem(this.storageKey);
  }
}
