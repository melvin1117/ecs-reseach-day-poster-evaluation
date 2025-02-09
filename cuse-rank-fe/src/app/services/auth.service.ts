import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://api.example.com'; // Replace with your actual API endpoint

  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.userSubject.next(response.user);
          // Store the token in a cookie with secure options.
          this.cookieService.set('authToken', response.token, undefined, '/', undefined, true, 'Lax');
        })
      );
  }

  signup(email: string, password: string, name: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${this.apiUrl}/signup`, { name, email, password })
      .pipe(
        tap(response => {
          this.userSubject.next(response.user);
          this.cookieService.set('authToken', response.token, undefined, '/', undefined, true, 'Lax');
        })
      );
  }


  logout(): void {
    this.userSubject.next(null);
    this.cookieService.delete('authToken', '/');
    // Optionally, call a logout API endpoint.
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }
}
