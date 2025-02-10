import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatePosterComponent } from './rate-poster.component';

describe('RatePosterComponent', () => {
  let component: RatePosterComponent;
  let fixture: ComponentFixture<RatePosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatePosterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatePosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
