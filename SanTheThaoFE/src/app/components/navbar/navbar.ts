import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: 'navbar.css'
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) { }
  keyword = '';

  search() {
    if (!this.keyword.trim()) return;
    this.router.navigate(['/courts'], { queryParams: { search: this.keyword } });
  }

  logout() {
    this.auth.logout();
    window.location.href = '/';
  }
}