import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  email = ''; 
  password = ''; 
  errorMsg = '';

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['socialLogin'] !== 'true') return;

      this.auth.saveUser({
        id: p['id'] ? +p['id'] : null,
        email: p['email'] || '',
        fullName: p['fullName'] ? decodeURIComponent(p['fullName']) : '',
        role: p['role'] || ''
      });

      this.router.navigate(['/'], {
        queryParams: { socialLogin: null, id: null, email: null, fullName: null, role: null },
        queryParamsHandling: 'merge'
      });
    });
  }

  submit() {

    this.errorMsg = '';
    
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (res: any) => {
        // res.data lúc này đã là { id, email, fullName, role } phẳng đét
        if (res && res.data) {
          this.auth.saveUser(res.data); //lưu vào local storage
          this.router.navigate(['/']);
        } else {
          this.errorMsg = 'Dữ liệu phản hồi từ server không hợp lệ.';
        }
      },
      error: (err) => { 
        // Lấy message lỗi từ Backend nếu có, không thì dùng câu mặc định
        this.errorMsg = err?.error?.message || 'Email hoặc mật khẩu không đúng.'; 
        this.cdr.detectChanges(); 
      }
    });
  }

  loginWithSocial(provider: 'Google' | 'Facebook' | 'GitHub') {
    this.errorMsg = '';
    this.auth.loginSocial(provider);
  }
}