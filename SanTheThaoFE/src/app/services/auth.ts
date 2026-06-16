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
}