import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav style="background:#0f172a;padding:12px 0;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
      <div style="max-width:1200px;margin:auto;padding:0 24px;display:flex;align-items:center;gap:24px">
        
        <!-- Logo -->
        <a routerLink="/" style="color:white;text-decoration:none;font-weight:700;font-size:20px;margin-right:16px">
          🏟️ Sân <span style="color:#3b82f6">Thể Thao</span>
        </a>

        <!-- Menu chính -->
        <a routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}"
           style="color:#cbd5e1;text-decoration:none;font-size:14px">Trang chủ</a>
        <a routerLink="/courts" routerLinkActive="active-link"
           style="color:#cbd5e1;text-decoration:none;font-size:14px">Đặt sân</a>
        <a routerLink="/news" routerLinkActive="active-link"
           style="color:#cbd5e1;text-decoration:none;font-size:14px">Tin tức</a>
        <a *ngIf="auth.isLoggedIn()" routerLink="/my-bookings" routerLinkActive="active-link"
           style="color:#cbd5e1;text-decoration:none;font-size:14px">Lịch sử</a>
        <a *ngIf="auth.isAdmin()" routerLink="/admin" routerLinkActive="active-link"
           style="color:#f59e0b;text-decoration:none;font-size:14px">⚙️ Admin</a>

        <!-- Spacer -->
        <span style="flex:1"></span>

        <!-- Chưa đăng nhập -->
        <ng-container *ngIf="!auth.isLoggedIn()">
          <a routerLink="/login" style="color:#cbd5e1;text-decoration:none;font-size:14px">Đăng nhập</a>
          <a routerLink="/register"
             style="background:#3b82f6;color:white;padding:8px 18px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600">
            Đăng ký
          </a>
        </ng-container>

        <!-- Đã đăng nhập -->
        <ng-container *ngIf="auth.isLoggedIn()">
          <span style="color:#94a3b8;font-size:14px">👤 {{ auth.getUser()?.fullName }}</span>
          <button (click)="logout()"
                  style="background:transparent;border:1px solid #475569;color:#94a3b8;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px">
            Đăng xuất
          </button>
        </ng-container>
      </div>
    </nav>
    <style>
      .active-link { color: white !important; font-weight: 600; }
    </style>
  `
})
export class NavbarComponent {
  constructor(public auth: AuthService) { }

  logout() {
    this.auth.logout();
    window.location.href = '/';
  }
}