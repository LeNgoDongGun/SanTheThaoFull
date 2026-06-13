import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'] // <-- Thêm cái này để nhận file CSS riêng
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private auth: AuthService, private router: Router) { }

  submit() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Vui lòng nhập đầy đủ email và mật khẩu.';
      return;
    }
    
    this.loading = true;
    this.errorMsg = '';
    
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.auth.saveUser(res.data ?? res);
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Email hoặc mật khẩu không đúng.';
      }
    });
  }
}