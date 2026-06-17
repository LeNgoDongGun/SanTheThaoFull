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




  // =========================================================
    // QUẢN LÝ PHIÊN ĐĂNG NHẬP BẰNG mã hóa base64
    // =========================================================

  saveUser(user: any) {
    // Biến object thành chuỗi -> Mã hóa Base64 -> Đảo ngược chuỗi -> Ném vào localStorage. gửi đi với key user_token
    localStorage.setItem('user_token', btoa(encodeURIComponent(JSON.stringify(user))).split('').reverse().join(''));
  }

  getUser(): any {
    const token = localStorage.getItem('user_token'); // Lấy chuỗi mã hóa từ trình duyệt
    if (!token) return null; // Nếu không có token thì coi như chưa đăng nhập
    try {
      // Đảo ngược chuỗi về lại dạng gốc -> Giải mã Base64 -> Dựng lại thành Object cho Angular xài
      const originalBase64 = token.split('').reverse().join('');
      return JSON.parse(decodeURIComponent(atob(originalBase64)));
    } 
    catch (e) {
      // Nếu chuỗi bị sửa khi dịch ra bị sai cấu trúc Object thì tự động logout
      this.logout();
      return null;
    }
  }

  logout() {
    //  xóa đúng key 'user_token' =>đăng xuất
    localStorage.removeItem('user_token');
  }

  // =========================================================

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