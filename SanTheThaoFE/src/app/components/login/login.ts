import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';
import {  ChangeDetectorRef } from '@angular/core'; // 1. Đảm bảo đã import cái này

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  email = ''; password = ''; loading = false; errorMsg = '';

  socials = [
    { id: 'google' as const, name: 'Google', icon: 'https://img.icons8.com/?size=100&id=4hR4Ih04Je2t&format=png&color=000000' },
    { id: 'facebook' as const, name: 'Facebook', icon: 'https://img.icons8.com/?size=100&id=118497&format=png&color=000000' },
    { id: 'github' as const, name: 'Github', icon: 'https://img.icons8.com/?size=100&id=62856&format=png&color=000000' }
  ];

  constructor(
  private auth: AuthService, 
  private router: Router, 
  private route: ActivatedRoute,
  private cdr: ChangeDetectorRef // 2. Inject vào constructor
) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['socialLogin'] !== 'true') return;
      this.loading = true;

      this.auth.saveUser({
        id: p['id'] ? +p['id'] : null,
        email: p['email'] || '',
        fullName: p['fullName'] ? decodeURIComponent(p['fullName']) : '',
        role: p['role'] || ''
      });

      this.router.navigate(['/'], {
        queryParams: { socialLogin: null, id: null, email: null, fullName: null, role: null },
        queryParamsHandling: 'merge'
      }).then(() => this.loading = false);
    });
  }

  submit() {
    // Tránh việc user click double khi đang đợi API
    if (this.loading) return; 

    this.loading = true; 
    this.errorMsg = '';
    this.cdr.detectChanges(); // Ép UI hiển thị chữ "Đang xử lý..." ngay lập tức
    
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.auth.saveUser(res.data);
          this.router.navigate(['/']);
        } else {
          // Trường hợp API trả về 200 OK nhưng success: false (Sai mật khẩu)
          this.loading = false; // Tắt loading đi để user còn sửa lỗi và bấm lại chứ!
          this.errorMsg = res?.message || 'Email hoặc mật khẩu không đúng.';
          this.cdr.detectChanges(); // Ép render lỗi lên màn hình ngay lập tức
        }
      },
      error: (err) => { 
        this.loading = false; // Tắt loading khi lỗi kết nối / lỗi 401, 500
        
        if (err.error && err.error.message) {
          this.errorMsg = err.error.message;
        } else if (err.status === 401 || err.status === 400) {
          this.errorMsg = 'Email hoặc mật khẩu không đúng.';
        } else {
          this.errorMsg = 'Đăng nhập thất bại. Vui lòng thử lại sau.';
        }
        
        this.cdr.detectChanges(); // Ép render lỗi
        console.error('Lỗi đăng nhập:', err);
      }
    });
  }

  loginWithSocial(provider: 'google' | 'facebook' | 'github') {
    this.loading = true; 
    this.errorMsg = '';
    this.auth.loginSocial(provider);
  }
}