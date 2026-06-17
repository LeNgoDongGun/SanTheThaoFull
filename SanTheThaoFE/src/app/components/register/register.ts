// register.ts
import { Component, inject, ChangeDetectorRef } from '@angular/core'; // Thêm ChangeDetectorRef vào đây
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // Inject ChangeDetectorRef chuẩn chỉnh theo phong cách mới

  form = { fullName: '', email: '', phoneNumber: '', password: '' };
  loading = false;
  errorMsg = '';
  successMsg = '';

  submit() {
    if (!this.form.fullName || !this.form.email || !this.form.password) {
      this.errorMsg = 'Vui lòng điền đầy đủ thông tin.';
      this.cdr.detectChanges(); // Ép cập nhật lỗi validation local lên UI
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = ''; // Reset lại thông báo thành công cũ nếu có
    this.cdr.detectChanges(); // Cập nhật trạng thái loading lên UI
    
    this.auth.register(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = '✅ Đăng ký tài khoản mới thành công!'; 
        this.cdr.detectChanges(); // Ép render thông báo thành công xanh lá cây lên màn hình ngay lập tức
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Đăng ký thất bại, vui lòng thử lại.';
        this.cdr.detectChanges(); // Ép render thông báo lỗi từ server trả về
      }
    });
  }
}