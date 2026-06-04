import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourtService } from '../../services/court';

@Component({
  selector: 'app-court-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="padding:24px;max-width:600px;margin:auto" *ngIf="court">
      <h2>{{ court.name }}</h2>
      <p><strong>Loại sân:</strong> {{ court.sportType?.name }}</p>
      <p><strong>Mô tả:</strong> {{ court.description || 'Không có mô tả' }}</p>
      <p><strong>Giá:</strong> {{ court.pricePerHour | number }}đ/giờ</p>
      <p><strong>Trạng thái:</strong> {{ court.isActive ? '✅ Còn trống' : '❌ Đã đầy' }}</p>
      <br>
      <a [routerLink]="['/booking', court.id]"
         style="background:#1a73e8;color:white;padding:10px 24px;border-radius:6px;text-decoration:none">
        Đặt Sân Ngay
      </a>
      &nbsp;&nbsp;
      <a routerLink="/courts" style="color:#1a73e8">← Quay lại</a>
    </div>
    <div style="padding:24px" *ngIf="!court && !loading">
      <p>Không tìm thấy sân.</p>
      <a routerLink="/courts" style="color:#1a73e8">← Quay lại</a>
    </div>
    <p style="padding:24px" *ngIf="loading">Đang tải...</p>
  `
})
export class CourtDetailComponent implements OnInit {
  court: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private courtService: CourtService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.courtService.getById(id).subscribe({
      next: (res: any) => {
        this.court = res.data ?? res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}