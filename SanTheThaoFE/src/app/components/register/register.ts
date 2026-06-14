// register.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html', // Trỏ về file HTML riêng biệt
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  // Thay constructor bằng inject cho "văn minh"
  private auth = inject(AuthService);
  private router = inject(Router);

  form = { fullName: '', email: '', phoneNumber: '', password: '' };
  loading = false;
  errorMsg = '';
  successMsg = '';

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