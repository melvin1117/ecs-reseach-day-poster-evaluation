import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = environment.apiBaseUrl; // base URL from your environment file

  constructor(private http: HttpClient) {}

  // Fetch all events
  getEvents(): Observable<Event[]> {
    const url = `${this.apiUrl}/events`;
    return this.http.get<Event[]>(url);
  }

  // Fetch a single event by its ID
  getEventById(id: string): Observable<Event> {
    const url = `${this.apiUrl}/events/${id}`;
    return this.http.get<Event>(url);
  }
}
