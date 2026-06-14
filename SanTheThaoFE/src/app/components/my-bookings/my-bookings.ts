import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="max-width:900px;margin:auto;padding:32px 24px">
      <h2 style="font-weight:700;margin-bottom:24px">📋 Lịch sử đặt sân</h2>
      <div *ngIf="!auth.isLoggedIn()" style="text-align:center;padding:60px;color:#64748b">
        <div style="font-size:3rem;margin-bottom:12px">🔒</div>
        <p>Vui lòng <a routerLink="/login" style="color:#3b82f6;font-weight:600">đăng nhập</a> để xem lịch sử.</p>
      </div>
      <p *ngIf="loading" style="text-align:center;color:#64748b;padding:40px">Đang tải...</p>
      
      <div *ngIf="!loading && auth.isLoggedIn() && bookings.length === 0" style="text-align:center;padding:60px;color:#64748b">
        <div style="font-size:3rem;margin-bottom:12px">📋</div>
        <p>Bạn chưa có đơn đặt sân nào.</p>
        <a routerLink="/courts" style="background:#3b82f6;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">Đặt sân ngay</a>
      </div>

      <div *ngIf="!loading && bookings.length > 0" style="display:flex;flex-direction:column;gap:16px">
        <div *ngFor="let b of bookings" style="background:white;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.08);display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center">
          <div>
            <h3 style="margin:0 0 8px;font-size:1rem;font-weight:700">{{ b.court?.name || 'Sân #' + b.courtId }}</h3>
            <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:0.875rem;color:#64748b">
              <span>📅 {{ b.bookingDate }}</span>
              <span>🕐 {{ b.startTime }} – {{ b.endTime }}</span>
              <span>💰 {{ b.totalPrice | number }}đ</span>
            </div>
            <p *ngIf="b.note" style="margin:8px 0 0;font-size:0.85rem;color:#94a3b8">📝 {{ b.note }}</p>
          </div>
          <div style="text-align:center">
            <span [style.background]="statusColor(b.status).bg" [style.color]="statusColor(b.status).text" style="padding:6px 14px;border-radius:20px;font-size:0.8rem;font-weight:600;white-space:nowrap">
              {{ statusLabel(b.status) }}
            </span>
            <br>
            <button *ngIf="b.status === 0" (click)="cancel(b.id)" style="margin-top:8px;background:transparent;border:1px solid #ef4444;color:#ef4444;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem">Hủy đơn</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  loading = true;

  constructor(
    public auth: AuthService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) { this.loading = false; return; }
    
    this.bookingService.getAll().subscribe({
      next: (res: any) => {
        // Đọc mảng thô hoặc bọc dữ liệu an toàn
        const all = Array.isArray(res) ? res : (res.data || []);
        
        // SỬA CHÍ MẠNG: Ép cả 2 ID về kiểu Số (Number) trước khi filter tránh lỗi vỡ mảng
        const currentUserId = Number(this.auth.getUser()?.id);
        this.bookings = all.filter((b: any) => Number(b.userId) === currentUserId);
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  statusLabel(status: number) {
    return ['⏳ Chờ xác nhận', '✅ Đã xác nhận', '❌ Đã hủy'][status] || 'Không rõ';
  }

  statusColor(status: number) {
    const colors: any = {
      0: { bg: '#fef3c7', text: '#d97706' },
      1: { bg: '#dcfce7', text: '#16a34a' },
      2: { bg: '#fee2e2', text: '#dc2626' }
    };
    return colors[status] || { bg: '#f1f5f9', text: '#64748b' };
  }

  cancel(id: number) {
    if (!confirm('Bạn có chắc muốn hủy đơn này?')) return;
    this.bookingService.delete(id).subscribe({
      next: () => {
        this.bookings = this.bookings.filter(b => b.id !== id);
        this.cdr.detectChanges();
      }
    });
  }
}