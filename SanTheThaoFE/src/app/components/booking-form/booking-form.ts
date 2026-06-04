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
  template: `
    <div style="max-width:560px;margin:auto;padding:32px 24px">

      <!-- Breadcrumb -->
      <div style="font-size:0.85rem;color:#64748b;margin-bottom:20px">
        <a routerLink="/courts" style="color:#3b82f6;text-decoration:none">← Quay lại danh sách sân</a>
      </div>

      <h2 style="font-weight:700;margin-bottom:24px">🗓️ Đặt sân</h2>

      <!-- Thông tin sân -->
      <div *ngIf="court" style="background:white;border-radius:12px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.08);margin-bottom:24px;display:flex;gap:16px;align-items:center">
        <div style="width:72px;height:72px;border-radius:10px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0">
          {{ court.sportType?.icon || '🏟️' }}
        </div>
        <div>
          <h3 style="margin:0 0 4px;font-size:1rem;font-weight:700">{{ court.name }}</h3>
          <p style="margin:0 0 4px;color:#64748b;font-size:0.85rem">{{ court.sportType?.name }}</p>
          <p style="margin:0;color:#3b82f6;font-weight:700">{{ court.pricePerHour | number }}đ/giờ</p>
        </div>
      </div>

      <!-- Cảnh báo chưa đăng nhập -->
      <div *ngIf="!auth.isLoggedIn()"
           style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:14px;margin-bottom:20px;font-size:0.9rem">
        ⚠️ Bạn cần
        <a routerLink="/login" style="color:#d97706;font-weight:600">đăng nhập</a>
        để đặt sân.
      </div>

      <!-- Form -->
      <div style="background:white;border-radius:12px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.08)">

        <div style="margin-bottom:16px">
          <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:6px">
            📅 Ngày đặt
          </label>
          <input type="date" [(ngModel)]="booking.bookingDate" [min]="today"
                 style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.9rem;box-sizing:border-box">
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
          <div>
            <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:6px">
              🕐 Giờ bắt đầu
            </label>
            <input type="time" [(ngModel)]="booking.startTime" (change)="calcPrice()"
                   style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.9rem;box-sizing:border-box">
          </div>
          <div>
            <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:6px">
              🕐 Giờ kết thúc
            </label>
            <input type="time" [(ngModel)]="booking.endTime" (change)="calcPrice()"
                   style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.9rem;box-sizing:border-box">
          </div>
        </div>

        <div style="margin-bottom:20px">
          <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:6px">
            📝 Ghi chú (tùy chọn)
          </label>
          <textarea [(ngModel)]="booking.note" rows="3" placeholder="Ghi chú thêm..."
                    style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.9rem;resize:none;box-sizing:border-box"></textarea>
        </div>

        <!-- Tổng tiền -->
        <div *ngIf="booking.totalPrice > 0"
             style="background:#eff6ff;border-radius:8px;padding:14px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center">
          <span style="color:#1e40af;font-weight:600">💰 Tổng tiền:</span>
          <span style="color:#1e40af;font-size:1.2rem;font-weight:700">{{ booking.totalPrice | number }}đ</span>
        </div>

        <!-- Nút đặt -->
        <button (click)="submit()" [disabled]="!auth.isLoggedIn() || loading"
                style="width:100%;background:#3b82f6;color:white;border:none;padding:13px;border-radius:8px;cursor:pointer;font-size:1rem;font-weight:700"
                [style.opacity]="!auth.isLoggedIn() ? '0.5' : '1'">
          {{ loading ? 'Đang xử lý...' : '✅ Xác nhận đặt sân' }}
        </button>

        <p *ngIf="errorMsg" style="margin-top:12px;color:#ef4444;font-size:0.875rem;text-align:center">
          {{ errorMsg }}
        </p>
      </div>
    </div>
  `
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

    this.courtService.getById(courtId).subscribe({
      next: (res: any) => {
        this.court = res.data ?? res;
        this.cdr.detectChanges();
      }
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
    this.bookingService.create(this.booking).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/my-bookings']);
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Đặt sân thất bại, vui lòng thử lại.';
      }
    });
  }
}