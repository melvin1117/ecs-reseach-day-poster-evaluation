import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, timer } from 'rxjs';
import { catchError, map, switchMap, retryWhen, delayWhen, takeWhile } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MappingService {
  private apiUrl =  environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Start Task API
  startTask(eventId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/fast-api/start-task?eventId=${eventId}`, {}).pipe(
      catchError(error => throwError(() => new Error(error)))
    );
  }

  // Get Task Status API (Polling with 5-second intervals, up to 5 retries)
  getTaskStatusWithPolling(taskId: string): Observable<any> {

    return timer(0, 5000).pipe( // Start immediately, then poll every 5 seconds
      switchMap(() => this.http.get(`${this.apiUrl}/fast-api/task-status?taskId=${taskId}`)),
      map((response: any) => response), // Transform response if needed
      takeWhile(response => response.status.toUpperCase() !== 'SUCCESS' && response.status !== 'FAILURE', true), // Stop when completed or failed
      retryWhen(errors => errors.pipe(
        delayWhen(() => timer(5000)), // Wait 5 seconds before retrying
        takeWhile((_, retryCount) => retryCount < 5) // Retry up to 5 times
      )),
      catchError(error => {
        console.error('Error polling task status:', error);
        return throwError(() => new Error(error));
      })
    );
  }
}
