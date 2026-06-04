import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourtService } from '../../services/court';
import { SporttypeService } from '../../services/sporttype';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- HERO -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);color:white;padding:80px 24px;text-align:center">
      <h1 style="font-size:2.8rem;font-weight:800;margin-bottom:16px">
        🏟️ Đặt Sân Thể Thao <span style="color:#3b82f6">Nhanh Chóng</span>
      </h1>
      <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:36px">
        Tìm và đặt sân thể thao yêu thích — tiện lợi, nhanh chóng, uy tín
      </p>
      <a routerLink="/courts"
         style="background:#3b82f6;color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:1rem;font-weight:600">
        Đặt sân ngay →
      </a>
    </div>

    <div style="max-width:1200px;margin:auto;padding:40px 24px">

      <!-- Môn thể thao -->
      <h2 style="font-weight:700;margin-bottom:20px">Chọn môn thể thao</h2>
      <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:48px">
        <a *ngFor="let sport of sportTypes"
           [routerLink]="['/courts']" [queryParams]="{sportTypeId: sport.id}"
           style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px 28px;text-decoration:none;text-align:center;min-width:120px;box-shadow:0 1px 4px rgba(0,0,0,0.06)">
          <div style="font-size:2rem">{{ sport.icon }}</div>
          <div style="font-size:0.9rem;font-weight:600;color:#1e293b;margin-top:8px">{{ sport.name }}</div>
        </a>
      </div>

      <!-- Sân nổi bật -->
      <h2 style="font-weight:700;margin-bottom:20px">Sân nổi bật</h2>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px">
        <div *ngFor="let court of courts.slice(0,8)"
             style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08)">

          <div style="height:160px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);display:flex;align-items:center;justify-content:center;font-size:3.5rem">
            {{ court.sportType?.icon || '🏟️' }}
          </div>

          <div style="padding:16px">
            <h3 style="margin:0 0 6px;font-size:1rem;font-weight:700">{{ court.name }}</h3>
            <p style="margin:0 0 4px;color:#64748b;font-size:0.85rem">{{ court.sportType?.name }}</p>
            <p style="margin:0 0 14px;color:#3b82f6;font-weight:700">{{ court.pricePerHour | number }}đ/giờ</p>

            <a [routerLink]="['/courts', court.id]"
               style="background:#3b82f6;color:white;padding:8px 18px;border-radius:6px;text-decoration:none;font-size:0.85rem;font-weight:600">
              Xem chi tiết
            </a>
          </div>
        </div>
      </div>

      <!-- Xem tất cả -->
      <div style="text-align:center;margin-top:32px">
        <a routerLink="/courts"
           style="border:2px solid #3b82f6;color:#3b82f6;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">
          Xem tất cả sân →
        </a>
      </div>

    </div>
  `
})
export class HomeComponent implements OnInit {
  courts: any[] = [];
  sportTypes: any[] = [];
  loading = true;

  constructor(
    private courtService: CourtService,
    private sportTypeService: SporttypeService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loading = true;

    this.courtService.getAll().subscribe({
      next: (res: any) => {
        this.courts = Array.isArray(res) ? res : (res.data || []);
        this.loading = false;
        this.cdr.detectChanges(); // FIX quan trọng
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.sportTypeService.getAll().subscribe({
      next: (res: any) => {
        this.sportTypes = Array.isArray(res) ? res : (res.data || []);
        this.cdr.detectChanges(); // FIX quan trọng
      }
    });
  }
}