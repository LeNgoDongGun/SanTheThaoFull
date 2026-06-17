import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingResultComponent } from './booking-result';

describe('BookingResult', () => {
  let component: BookingResultComponent;
  let fixture: ComponentFixture<BookingResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingResultComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
