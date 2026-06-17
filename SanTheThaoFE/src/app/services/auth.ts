import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): any {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  logout() {
    localStorage.removeItem('user');
  }

  isLoggedIn() {
    return !!this.getUser();
  }

  isAdmin() {
    const role = this.getUser()?.role;
    return role === 'Admin' || role === 'admin';
  }

    // Chuyển thành kiểu void vì dùng window.location.href sẽ làm reload/chuyển toàn bộ trang
  loginSocial(provider: 'Google' | 'Facebook' | 'GitHub'): void {
    window.location.href = `${this.api}/login/${provider}`;
  }


  // Thêm <ApiResponse> vào đây để báo cho Angular biết cấu trúc trả về của API .NET
  // Đổi kiểu trả về thành Observable<boolean> nè "cu"
  checkEmail(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.api}/check-email`, { email });
  }

  resetPasswordDirect(email: string, passwordNew: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.api}/reset-password-direct`, { 
      email: email, 
      newPassword: passwordNew 
    });
  }
}