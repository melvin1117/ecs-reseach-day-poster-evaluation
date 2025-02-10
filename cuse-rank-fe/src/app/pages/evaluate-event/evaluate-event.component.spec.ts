import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluateEventComponent } from './evaluate-event.component';

describe('EvaluateEventComponent', () => {
  let component: EvaluateEventComponent;
  let fixture: ComponentFixture<EvaluateEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluateEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluateEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
