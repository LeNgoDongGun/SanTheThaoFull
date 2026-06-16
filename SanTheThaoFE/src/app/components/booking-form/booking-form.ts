import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourtService } from '../../services/court';
import { BookingService } from '../../services/booking';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './booking-form.html'
})
export class BookingFormComponent implements OnInit {
  court: any = null;
  booking: any = {
    courtId: 0, userId: 0,
    bookingDate: '', startTime: '', endTime: '',
    totalPrice: 0, status: 0, note: ''
  };
  today = new Date().toISOString().split('T')[0];
  loading = false;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courtService: CourtService,
    private bookingService: BookingService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const courtId = Number(this.route.snapshot.paramMap.get('courtId'));
    this.booking.courtId = courtId;
    this.booking.userId = this.auth.getUser()?.id || 0;

    this.courtService.getById(courtId).subscribe(court => {
      this.court = court;
      this.cdr.detectChanges();
    });
  }

  calcPrice() {
    if (!this.booking.startTime || !this.booking.endTime || !this.court) return;
    const [sh, sm] = this.booking.startTime.split(':').map(Number);
    const [eh, em] = this.booking.endTime.split(':').map(Number);
    const hours = (eh * 60 + em - sh * 60 - sm) / 60;
    this.booking.totalPrice = hours > 0 ? hours * this.court.pricePerHour : 0;
  }

  submit() {
    if (!this.booking.bookingDate || !this.booking.startTime || !this.booking.endTime) {
      this.errorMsg = 'Vui lòng điền đầy đủ thông tin.';
      return;
    }
    if (this.booking.totalPrice <= 0) {
      this.errorMsg = 'Giờ kết thúc phải sau giờ bắt đầu.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    if (this.booking.startTime.length === 5) this.booking.startTime += ':00';
    if (this.booking.endTime.length === 5) this.booking.endTime += ':00';

    this.bookingService.create(this.booking).subscribe({
      next: () => this.router.navigate(['/my-bookings']),
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Đặt sân thất bại, vui lòng thử lại.';
        this.cdr.detectChanges();
      }
    });
  }
}