import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';
import { environment } from '../../environments/environment';
import { Organizer } from '../models/organizer.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  // Fetch all events
  getEvents(): Observable<{ message: string, events: Event[]}> {
    const url = `${this.apiUrl}/events`;
    return this.http.get<{ message: string, events: Event[]}>(url);
  }

  // Fetch a single event by its ID
  getEventById(id: string): Observable<{ message: string, event: Event}> {
    const url = `${this.apiUrl}/events?eventId=${id}`;
    return this.http.get<{ message: string, event: Event}>(url);
  }

  // Fetch organizers from the API endpoint /events/organizers.
  getOrganizers(): Observable<{ message: string, organizers: Organizer[]}> {
    return this.http.get<{ message: string, organizers: Organizer[]}>(`${this.apiUrl}/events/organizers`);
  }

  // Create a new event via POST /events.
  createEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, eventData);
  }

  // Update an existing event via PUT /events/:id.
  updateEvent(eventId: string, eventData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/events/${eventId}`, eventData);
  }
}
