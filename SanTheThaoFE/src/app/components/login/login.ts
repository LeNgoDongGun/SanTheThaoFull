import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {

  username = '';
  password = '';

  constructor(private auth: AuthService) { }

  login() {
    this.auth.login({
      email: this.username,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem("user", JSON.stringify(res));
        alert("Đăng nhập thành công");
        location.href = '/home';
      },
      error: () => alert("Sai tài khoản")
    });
  }
}