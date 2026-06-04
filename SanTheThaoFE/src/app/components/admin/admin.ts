import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CourtService } from '../../services/court';
import { BookingService } from '../../services/booking';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="max-width:1100px;margin:auto;padding:32px 24px">

      <!-- Kiểm tra quyền -->
      <div *ngIf="!auth.isAdmin()"
           style="text-align:center;padding:60px;color:#64748b">
        <div style="font-size:3rem">🔒</div>
        <p>Bạn không có quyền truy cập trang này.</p>
        <a routerLink="/" style="color:#3b82f6;font-weight:600">← Về trang chủ</a>
      </div>

      <ng-container *ngIf="auth.isAdmin()">
        <h2 style="font-weight:700;margin-bottom:24px">⚙️ Admin Dashboard</h2>

        <!-- Tabs -->
        <div style="display:flex;gap:4px;background:#f1f5f9;padding:4px;border-radius:10px;margin-bottom:28px;width:fit-content">
          <button *ngFor="let tab of tabs" (click)="activeTab = tab.key"
                  [style.background]="activeTab === tab.key ? 'white' : 'transparent'"
                  [style.color]="activeTab === tab.key ? '#1e293b' : '#64748b'"
                  [style.box-shadow]="activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'"
                  style="padding:8px 20px;border:none;border-radius:8px;cursor:pointer;font-size:0.875rem;font-weight:500">
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab: Thống kê -->
        <div *ngIf="activeTab === 'dashboard'">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:32px">
            <div style="background:white;border-radius:12px;padding:24px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
              <div style="font-size:2.5rem">🏟️</div>
              <div style="font-size:2rem;font-weight:800;margin:8px 0">{{ courts.length }}</div>
              <div style="color:#64748b;font-size:0.875rem">Tổng sân</div>
            </div>
            <div style="background:white;border-radius:12px;padding:24px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
              <div style="font-size:2.5rem">📋</div>
              <div style="font-size:2rem;font-weight:800;margin:8px 0">{{ bookings.length }}</div>
              <div style="color:#64748b;font-size:0.875rem">Đơn đặt</div>
            </div>
            <div style="background:white;border-radius:12px;padding:24px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
              <div style="font-size:2.5rem">⏳</div>
              <div style="font-size:2rem;font-weight:800;margin:8px 0">{{ pendingBookings }}</div>
              <div style="color:#64748b;font-size:0.875rem">Chờ xác nhận</div>
            </div>
            <div style="background:white;border-radius:12px;padding:24px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
              <div style="font-size:2.5rem">💰</div>
              <div style="font-size:1.4rem;font-weight:800;margin:8px 0">{{ totalRevenue | number }}đ</div>
              <div style="color:#64748b;font-size:0.875rem">Doanh thu</div>
            </div>
          </div>
        </div>

        <!-- Tab: Quản lý sân -->
        <div *ngIf="activeTab === 'courts'">
          <h3 style="font-weight:700;margin-bottom:16px">🏟️ Danh sách sân</h3>
          <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#f8fafc;font-size:0.85rem;color:#64748b">
                  <th style="padding:12px 16px;text-align:left">Tên sân</th>
                  <th style="padding:12px 16px;text-align:left">Môn</th>
                  <th style="padding:12px 16px;text-align:left">Giá/giờ</th>
                  <th style="padding:12px 16px;text-align:center">Trạng thái</th>
                  <th style="padding:12px 16px;text-align:center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of courts"
                    style="border-top:1px solid #f1f5f9;font-size:0.875rem">
                  <td style="padding:12px 16px;font-weight:600">{{ c.name }}</td>
                  <td style="padding:12px 16px;color:#64748b">{{ c.sportType?.name }}</td>
                  <td style="padding:12px 16px;color:#3b82f6;font-weight:600">{{ c.pricePerHour | number }}đ</td>
                  <td style="padding:12px 16px;text-align:center">
                    <span [style.background]="c.isActive ? '#dcfce7' : '#fee2e2'"
                          [style.color]="c.isActive ? '#16a34a' : '#dc2626'"
                          style="padding:4px 12px;border-radius:12px;font-size:0.78rem;font-weight:600">
                      {{ c.isActive ? 'Hoạt động' : 'Tạm đóng' }}
                    </span>
                  </td>
                  <td style="padding:12px 16px;text-align:center">
                    <button (click)="toggleCourt(c)"
                            style="background:transparent;border:1px solid #e2e8f0;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;color:#475569">
                      {{ c.isActive ? 'Tạm đóng' : 'Mở lại' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab: Quản lý đơn -->
        <div *ngIf="activeTab === 'bookings'">
          <h3 style="font-weight:700;margin-bottom:16px">📋 Danh sách đơn đặt sân</h3>
          <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#f8fafc;font-size:0.85rem;color:#64748b">
                  <th style="padding:12px 16px;text-align:left">Sân</th>
                  <th style="padding:12px 16px;text-align:left">Ngày</th>
                  <th style="padding:12px 16px;text-align:left">Giờ</th>
                  <th style="padding:12px 16px;text-align:left">Tiền</th>
                  <th style="padding:12px 16px;text-align:center">Trạng thái</th>
                  <th style="padding:12px 16px;text-align:center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of bookings"
                    style="border-top:1px solid #f1f5f9;font-size:0.875rem">
                  <td style="padding:12px 16px;font-weight:600">{{ b.court?.name || '#' + b.courtId }}</td>
                  <td style="padding:12px 16px;color:#64748b">{{ b.bookingDate }}</td>
                  <td style="padding:12px 16px;color:#64748b">{{ b.startTime }} – {{ b.endTime }}</td>
                  <td style="padding:12px 16px;color:#3b82f6;font-weight:600">{{ b.totalPrice | number }}đ</td>
                  <td style="padding:12px 16px;text-align:center">
                    <span [style.background]="statusColor(b.status).bg"
                          [style.color]="statusColor(b.status).text"
                          style="padding:4px 12px;border-radius:12px;font-size:0.78rem;font-weight:600">
                      {{ statusLabel(b.status) }}
                    </span>
                  </td>
                  <td style="padding:12px 16px;text-align:center;display:flex;gap:6px;justify-content:center">
                    <button *ngIf="b.status === 0" (click)="confirmBooking(b)"
                            style="background:#dcfce7;border:none;color:#16a34a;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600">
                      Xác nhận
                    </button>
                    <button *ngIf="b.status !== 2" (click)="cancelBooking(b)"
                            style="background:#fee2e2;border:none;color:#dc2626;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600">
                      Hủy
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </ng-container>
    </div>
  `
})
export class AdminComponent implements OnInit {
  courts: any[] = [];
  bookings: any[] = [];
  activeTab = 'dashboard';
  tabs = [
    { key: 'dashboard', label: '📊 Thống kê' },
    { key: 'courts', label: '🏟️ Sân' },
    { key: 'bookings', label: '📋 Đơn đặt' }
  ];

  get pendingBookings() { return this.bookings.filter(b => b.status === 0).length; }
  get totalRevenue() { return this.bookings.filter(b => b.status === 1).reduce((s, b) => s + b.totalPrice, 0); }

  constructor(
    public auth: AuthService,
    private courtService: CourtService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (!this.auth.isAdmin()) return;
    this.courtService.getAll().subscribe({
      next: (res: any) => {
        this.courts = Array.isArray(res) ? res : (res.data || []);
        this.cdr.detectChanges();
      }
    });
    this.bookingService.getAll().subscribe({
      next: (res: any) => {
        this.bookings = Array.isArray(res) ? res : (res.data || []);
        this.cdr.detectChanges();
      }
    });
  }

  toggleCourt(court: any) {
    court.isActive = !court.isActive;
    this.courtService.update(court.id, court).subscribe();
  }

  confirmBooking(b: any) {
    b.status = 1;
    this.bookingService.update(b.id, b).subscribe();
    this.cdr.detectChanges();
  }

  cancelBooking(b: any) {
    if (!confirm('Hủy đơn này?')) return;
    b.status = 2;
    this.bookingService.update(b.id, b).subscribe();
    this.cdr.detectChanges();
  }

  statusLabel(s: number) { return ['⏳ Chờ', '✅ Xác nhận', '❌ Đã hủy'][s] || '?'; }
  statusColor(s: number) {
    return [
      { bg: '#fef3c7', text: '#d97706' },
      { bg: '#dcfce7', text: '#16a34a' },
      { bg: '#fee2e2', text: '#dc2626' }
    ][s] || { bg: '#f1f5f9', text: '#64748b' };
  }
}