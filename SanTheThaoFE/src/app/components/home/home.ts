import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="text-align:center;padding:60px 20px">
      <h1>Chào mừng đến Hệ thống Đặt Sân Thể Thao</h1>
      <p style="font-size:18px;color:#666">Tìm và đặt sân thể thao nhanh chóng, tiện lợi</p>
      <a routerLink="/courts" 
         style="background:#1a73e8;color:white;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px">
        Xem Danh Sách Sân
      </a>
    </div>
  `
})
export class HomeComponent { }