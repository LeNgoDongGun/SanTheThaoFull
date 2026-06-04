import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourtService } from '../../services/court';

@Component({
  selector: 'app-courts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="padding:24px">
      <h2>Danh Sách Sân</h2>
      <div style="display:flex;flex-wrap:wrap;gap:20px">
        <div *ngFor="let court of courts"
             style="border:1px solid #ddd;border-radius:8px;padding:16px;width:280px">
          <h3>{{ court.name }}</h3>
          <p>{{ court.sportType?.name }}</p>
          <p style="color:#1a73e8;font-weight:bold">
            {{ court.pricePerHour | number }}đ/giờ
          </p>
          <p>{{ court.description }}</p>
          <a [routerLink]="['/courts', court.id]"
             style="background:#1a73e8;color:white;padding:8px 16px;border-radius:4px;text-decoration:none">
            Xem chi tiết
          </a>
        </div>
      </div>
      <p *ngIf="courts.length === 0 && !loading">Không có sân nào.</p>
      <p *ngIf="loading">Đang tải...</p>
    </div>
  `
})
export class CourtsComponent implements OnInit {
  courts: any[] = [];
  loading = true;

  constructor(
    private courtService: CourtService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.courtService.getAll().subscribe({
      next: (res: any) => {
        this.courts = Array.isArray(res) ? res : (res.data || []);
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