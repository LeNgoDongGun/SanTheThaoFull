import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="padding:24px;max-width:480px;margin:auto">
      <h2>Đặt Sân</h2>
      <div style="margin-bottom:16px">
        <label>Ngày đặt</label><br>
        <input type="date" [(ngModel)]="booking.bookingDate"
               style="width:100%;padding:8px;margin-top:4px;border:1px solid #ddd;border-radius:4px">
      </div>
      <div style="margin-bottom:16px">
        <label>Giờ bắt đầu</label><br>
        <input type="time" [(ngModel)]="booking.startTime"
               style="width:100%;padding:8px;margin-top:4px;border:1px solid #ddd;border-radius:4px">
      </div>
      <div style="margin-bottom:16px">
        <label>Giờ kết thúc</label><br>
        <input type="time" [(ngModel)]="booking.endTime"
               style="width:100%;padding:8px;margin-top:4px;border:1px solid #ddd;border-radius:4px">
      </div>
      <div style="margin-bottom:16px">
        <label>Ghi chú</label><br>
        <textarea [(ngModel)]="booking.note"
                  style="width:100%;padding:8px;margin-top:4px;border:1px solid #ddd;border-radius:4px"></textarea>
      </div>
      <button (click)="submit()"
              style="background:#1a73e8;color:white;padding:10px 24px;border:none;border-radius:6px;cursor:pointer;font-size:16px">
        Xác Nhận Đặt Sân
      </button>
      <p *ngIf="message" [style.color]="success ? 'green' : 'red'">{{ message }}</p>
      <br>
      <a routerLink="/courts" style="color:#1a73e8">← Quay lại</a>
    </div>
  `
})
export class BookingFormComponent implements OnInit {
  booking: any = {
    courtId: 0, userId: 1, bookingDate: '',
    startTime: '', endTime: '', totalPrice: 0, status: 0, note: ''
  };
  message = '';
  success = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) { }

  ngOnInit() {
    this.booking.courtId = Number(this.route.snapshot.paramMap.get('courtId'));
  }

  submit() {
    this.bookingService.create(this.booking).subscribe({
      next: () => {
        this.success = true;
        this.message = '✅ Đặt sân thành công!';
        setTimeout(() => this.router.navigate(['/courts']), 2000);
      },
      error: () => {
        this.success = false;
        this.message = '❌ Đặt sân thất bại, vui lòng thử lại.';
      }
    });
  }
}