import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private storage: LocalStorageService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.storage.retrieve('jwt');
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(req);
  }
}
