import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { evaluateGuard } from './evaluate.guard';

describe('evaluateGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => evaluateGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
