import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private cookieService: CookieService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Define endpoints that should skip token injection.
    const skipTokenEndpoints = ['/auth/login', '/auth/signup'];

    // Check if the request URL contains any of the endpoints in skipTokenEndpoints.
    const shouldSkipToken = skipTokenEndpoints.some(endpoint => req.url.includes(endpoint));

    if (shouldSkipToken) {
      // If the request URL matches one of the skip endpoints, forward it unmodified.
      return next.handle(req);
    }

    // Otherwise, retrieve the token from the cookie.
    const token = this.cookieService.get('authToken');

    // If a token exists, clone the request and add the Authorization header.
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    // If no token exists, simply forward the original request.
    return next.handle(req);
  }
}
