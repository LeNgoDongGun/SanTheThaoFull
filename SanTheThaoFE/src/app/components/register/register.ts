import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html'
})
export class RegisterComponent {

  username = '';
  password = '';

  apiUrl = 'http://localhost:5135/api/auth';

  constructor(private http: HttpClient) { }

  register() {
    this.http.post(`${this.apiUrl}/register`, {
      email: this.username,
      passwordHash: this.password,
      fullName: "User",
      role: "User"
    }).subscribe({
      next: () => alert("Đăng ký thành công"),
      error: () => alert("Lỗi đăng ký")
    });
  }
}