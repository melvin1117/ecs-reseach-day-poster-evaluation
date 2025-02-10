import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { evaluateRedirectGuard } from './evaluate-redirect.guard';

describe('evaluateRedirectGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => evaluateRedirectGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
