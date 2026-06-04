import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;padding:24px">
      <div style="background:white;border-radius:16px;padding:36px;width:100%;max-width:460px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">

        <div style="text-align:center;margin-bottom:28px">
          <div style="font-size:3rem">🏟️</div>
          <h2 style="margin:8px 0 4px;font-weight:700">Tạo tài khoản</h2>
          <p style="color:#64748b;font-size:0.875rem">Đăng ký để đặt sân thể thao</p>
        </div>

        <div *ngIf="errorMsg"
             style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;margin-bottom:16px;color:#dc2626;font-size:0.875rem">
          {{ errorMsg }}
        </div>

        <div *ngIf="successMsg"
             style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin-bottom:16px;color:#16a34a;font-size:0.875rem">
          {{ successMsg }}
        </div>

        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:6px">Họ tên</label>
          <input [(ngModel)]="form.fullName" placeholder="Nguyễn Văn A"
                 style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.9rem;box-sizing:border-box">
        </div>

        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:6px">Email</label>
          <input type="email" [(ngModel)]="form.email" placeholder="email@example.com"
                 style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.9rem;box-sizing:border-box">
        </div>

        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:6px">Số điện thoại</label>
          <input [(ngModel)]="form.phoneNumber" placeholder="0901234567"
                 style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.9rem;box-sizing:border-box">
        </div>

        <div style="margin-bottom:24px">
          <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:6px">Mật khẩu</label>
          <input type="password" [(ngModel)]="form.password" placeholder="••••••••"
                 style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.9rem;box-sizing:border-box">
        </div>

        <button (click)="submit()" [disabled]="loading"
                style="width:100%;background:#3b82f6;color:white;border:none;padding:12px;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer">
          {{ loading ? 'Đang xử lý...' : 'Đăng ký' }}
        </button>

        <p style="text-align:center;margin-top:20px;font-size:0.875rem;color:#64748b">
          Đã có tài khoản?
          <a routerLink="/login" style="color:#3b82f6;font-weight:600;text-decoration:none">Đăng nhập</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form = { fullName: '', email: '', phoneNumber: '', password: '' };
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private auth: AuthService, private router: Router) { }

  submit() {
    if (!this.form.fullName || !this.form.email || !this.form.password) {
      this.errorMsg = 'Vui lòng điền đầy đủ thông tin.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.auth.register(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = '✅ Đăng ký thành công! Đang chuyển hướng...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Đăng ký thất bại, vui lòng thử lại.';
      }
    });
  }
}