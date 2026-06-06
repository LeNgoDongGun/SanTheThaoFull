import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourtService } from '../../services/court';
import { SporttypeService } from '../../services/sporttype';
import { NewsService } from '../../services/news';

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
    <!-- 3 bước đặt sân -->
<div style="background:#f8fafc;padding:60px 24px;text-align:center;margin:0 -24px 48px">
  <p style="color:#3b82f6;font-weight:700;font-size:0.875rem;letter-spacing:0.1em;margin-bottom:8px">ĐƠN GIẢN</p>
  <h2 style="font-size:2rem;font-weight:800;color:#0f172a;margin-bottom:40px">Chỉ 3 bước đặt sân</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;max-width:900px;margin:auto">
    <div style="background:white;border-radius:16px;padding:32px 24px;text-align:left;position:relative;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06)">
      <div style="position:absolute;right:16px;top:16px;font-size:4rem;font-weight:900;color:#e2e8f0;line-height:1">01</div>
      <div style="background:#3b82f6;width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:16px">🏟️</div>
      <h3 style="font-weight:700;margin-bottom:8px;font-size:1rem">Chọn môn & sân</h3>
      <p style="color:#64748b;font-size:0.875rem;line-height:1.6">Duyệt qua các môn thể thao và chọn sân phù hợp với bạn</p>
    </div>
    <div style="background:white;border-radius:16px;padding:32px 24px;text-align:left;position:relative;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06)">
      <div style="position:absolute;right:16px;top:16px;font-size:4rem;font-weight:900;color:#e2e8f0;line-height:1">02</div>
      <div style="background:#f97316;width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:16px">📅</div>
      <h3 style="font-weight:700;margin-bottom:8px;font-size:1rem">Chọn ngày & giờ</h3>
      <p style="color:#64748b;font-size:0.875rem;line-height:1.6">Xem lịch trống theo thời gian thực, chọn khung giờ muốn đặt</p>
    </div>
    <div style="background:white;border-radius:16px;padding:32px 24px;text-align:left;position:relative;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06)">
      <div style="position:absolute;right:16px;top:16px;font-size:4rem;font-weight:900;color:#e2e8f0;line-height:1">03</div>
      <div style="background:#22c55e;width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:16px">✅</div>
      <h3 style="font-weight:700;margin-bottom:8px;font-size:1rem">Xác nhận & Chơi!</h3>
      <p style="color:#64748b;font-size:0.875rem;line-height:1.6">Xác nhận thông tin, nhận thông báo và đến sân đúng giờ</p>
    </div>
  </div>
</div>

      <!-- Môn thể thao -->
      <h2 style="font-weight:700;margin-bottom:20px;text-align:center">Chọn môn thể thao</h2>
      <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:48px;justify-content:center">
        <a *ngFor="let sport of sportTypes"
           [routerLink]="['/courts']" [queryParams]="{sportTypeId: sport.id}"
           style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px 28px;text-decoration:none;text-align:center;min-width:120px;box-shadow:0 1px 4px rgba(0,0,0,0.06)">
          <div style="font-size:2rem">{{ sport.icon }}</div>
          <div style="font-size:0.9rem;font-weight:600;color:#1e293b;margin-top:8px">{{ sport.name }}</div>
        </a>
      </div>

      <!-- Sân đặt nhiều nhất -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h2 style="font-weight:700;margin:0">🔥 Sân được đặt nhiều nhất</h2>
        <a routerLink="/courts" style="color:#3b82f6;font-size:0.875rem;text-decoration:none">Xem tất cả →</a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;margin-bottom:48px">
        <div *ngFor="let court of courts"
             style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
          <div style="height:160px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);display:flex;align-items:center;justify-content:center;overflow:hidden">
            <img *ngIf="court.imageUrl" [src]="court.imageUrl" [alt]="court.name"
                 style="width:100%;height:100%;object-fit:cover" (error)="court.imageUrl=null">
            <span *ngIf="!court.imageUrl" style="font-size:3.5rem">{{ court.sportType?.icon || '🏟️' }}</span>
          </div>
          <div style="padding:16px">
            <p style="margin:0 0 4px;color:#64748b;font-size:0.8rem">{{ court.sportType?.name }}</p>
            <h3 style="margin:0 0 6px;font-size:1rem;font-weight:700">{{ court.name }}</h3>
            <p style="margin:0 0 14px;color:#3b82f6;font-weight:700">{{ court.pricePerHour | number }}đ/giờ</p>
            <a [routerLink]="['/courts', court.id]"
               style="background:#3b82f6;color:white;padding:8px 18px;border-radius:6px;text-decoration:none;font-size:0.85rem;font-weight:600">
              Xem chi tiết
            </a>
          </div>
        </div>
      </div>

      <!-- Tin tức mới nhất -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h2 style="font-weight:700;margin:0">📰 Tin tức mới nhất</h2>
        <a routerLink="/news" style="color:#3b82f6;font-size:0.875rem;text-decoration:none">Xem tất cả →</a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px">
        <div *ngFor="let post of news"
             style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
          <div style="height:140px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);display:flex;align-items:center;justify-content:center;overflow:hidden">
            <img *ngIf="post.thumbnailUrl" [src]="post.thumbnailUrl" [alt]="post.title"
                 style="width:100%;height:100%;object-fit:cover" (error)="post.thumbnailUrl=null">
            <span *ngIf="!post.thumbnailUrl" style="font-size:3rem">📰</span>
          </div>
          <div style="padding:16px">
            <span style="background:#eff6ff;color:#3b82f6;padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600">
              {{ post.category }}
            </span>
            <h3 style="margin:10px 0 6px;font-size:0.9rem;font-weight:700;line-height:1.4">
              {{ post.title }}
            </h3>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
              <span style="font-size:0.78rem;color:#94a3b8">{{ post.createdAt | date:'dd/MM/yyyy' }}</span>
              <a [routerLink]="['/news', post.id]"
                 style="color:#3b82f6;font-size:0.85rem;font-weight:600;text-decoration:none">Đọc →</a>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class HomeComponent implements OnInit {
  courts: any[] = [];
  sportTypes: any[] = [];
  news: any[] = [];

  constructor(
    private courtService: CourtService,
    private sportTypeService: SporttypeService,
    private newsService: NewsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.sportTypeService.getAll().subscribe({
      next: (res: any) => {
        this.sportTypes = Array.isArray(res) ? res : (res.data || []);
        this.cdr.detectChanges();
      }
    });

    this.courtService.getAll().subscribe({
      next: (res: any) => {
        const all = Array.isArray(res) ? res : (res.data || []);
        this.courts = all
          .sort((a: any, b: any) => (b.bookings?.length || 0) - (a.bookings?.length || 0))
          .slice(0, 4);
        this.cdr.detectChanges();
      }
    });

    this.newsService.getAll().subscribe({
      next: (res: any) => {
        const all = Array.isArray(res) ? res : (res.data || []);
        this.news = all.slice(0, 4);
        this.cdr.detectChanges();
      }
    });
  }
}