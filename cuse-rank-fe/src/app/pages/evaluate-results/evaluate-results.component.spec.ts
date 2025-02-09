import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluateResultsComponent } from './evaluate-results.component';

describe('EvaluateResultsComponent', () => {
  let component: EvaluateResultsComponent;
  let fixture: ComponentFixture<EvaluateResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluateResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluateResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
