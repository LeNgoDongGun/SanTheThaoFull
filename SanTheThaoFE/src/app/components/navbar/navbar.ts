// navbar.ts
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html', // Quay xe về với file HTML chính chủ
  styleUrls: ['./navbar.css']    // Nếu có file css riêng
})
export class NavbarComponent {
  // Dùng inject nhìn hiện đại hơn hẳn constructor cũ
  public auth = inject(AuthService); 

  logout() {
    this.auth.logout();
    window.location.href = '/';
  }
}