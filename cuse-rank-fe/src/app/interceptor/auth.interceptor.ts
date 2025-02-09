import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private cookieService: CookieService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Endpoints to skip token injection.
    const skipTokenEndpoints = ['/auth/login', '/auth/signup'];
    const shouldSkipToken = skipTokenEndpoints.some(endpoint => req.url.includes(endpoint));

    if (shouldSkipToken) {
      // Debug log for skipped endpoints.
      console.log(`Skipping auth header for ${req.url}`);
      return next.handle(req);
    }

    // Retrieve the token from the cookie.
    const token = this.cookieService.get('authToken');
    console.log(`Token from cookie for ${req.url}:`, token);

    // If a token exists, add the Authorization header.
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    // If no token exists, forward the request unmodified.
    return next.handle(req);
  }
}
