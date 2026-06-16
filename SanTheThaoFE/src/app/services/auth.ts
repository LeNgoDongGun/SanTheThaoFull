import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:5135/api/auth';

  constructor(private http: HttpClient) { }

  login(data: { email: string, password: string }) {
    return this.http.post<any>(`${this.api}/login`, data);
  }

  register(data: any) {
    return this.http.post<any>(`${this.api}/register`, data);
  }

  saveUser(user: any) {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser(): any {
    const u = localStorage.getItem('user');
    // Bọc try-catch đề phòng parse lỗi chuỗi String không hợp lệ gây sập app
    try {
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem('user');
  }

  isLoggedIn() {
    return !!this.getUser();
  }

  isAdmin() {
    // Dùng toLowerCase() check cho gọn, đỡ phải viết || rườm rà
    const role = this.getUser()?.role;
    return role?.toLowerCase() === 'admin';
  }

  loginSocial(provider: 'google' | 'facebook' | 'github'): void {
    // Backend của mày cấu hình endpoint là: api/Auth/login/{provider}
    // Trong khi biến api đang là: .../api/auth => Thiếu chữ /login
    window.location.href = `${this.api}/login/${provider}`; 
  }
}