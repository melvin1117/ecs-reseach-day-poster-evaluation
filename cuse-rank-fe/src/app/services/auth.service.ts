import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient, private router: Router, private storage: LocalStorageService) {}

  login(email: string, password: string) {
    this.http.post(`${this.apiUrl}/login`, { email, password }).subscribe((res: any) => {
      this.storage.store('jwt', res.token);
      this.router.navigate(['/']);
    });
  }

  logout() {
    this.storage.clear('jwt');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.storage.retrieve('jwt');
  }
}
