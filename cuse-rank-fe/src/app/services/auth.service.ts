import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { User, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Base URL taken from the environment file.
  private apiUrl = environment.apiBaseUrl;
  
  // Observable user state.
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  /**
   * Signup API call.
   * Endpoint: POST /auth/signup
   * Request Body: { name: string; email: string; password: string }
   * Response: { message: string }
   */
  signup(name: string, email: string, password: string): Observable<{ message: string }> {
    const url = `${this.apiUrl}/auth/signup`;
    return this.http.post<{ message: string }>(url, { name, email, password });
  }

  /**
   * Login API call.
   * Endpoint: POST /auth/login
   * Request Body: { email: string; password: string }
   * Response: { accessToken: string, name: string, email: string, role: string }
   *
   * On success, store the access token in a cookie and update the current user.
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const url = `${this.apiUrl}/auth/login`;
    return this.http.post<LoginResponse>(url, { email, password }).pipe(
      tap(response => {
        // Store the token in a secure cookie.
        this.cookieService.set('authToken', response.accessToken, undefined, '/', undefined, true, 'Lax');
        // Update the current user.
        this.userSubject.next({
          name: response.name,
          email: response.email,
          role: response.role
        });
      })
    );
  }

  /**
   * Logs out the current user.
   */
  logout(): void {
    this.userSubject.next(null);
    this.cookieService.delete('authToken', '/');
  }

  /**
   * Returns the current user synchronously.
   */
  get currentUser(): User | null {
    return this.userSubject.value;
  }
}
