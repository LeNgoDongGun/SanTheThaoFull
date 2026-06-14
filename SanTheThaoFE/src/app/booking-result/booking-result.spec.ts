import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingResult } from './booking-result';

describe('BookingResult', () => {
  let component: BookingResult;
  let fixture: ComponentFixture<BookingResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
