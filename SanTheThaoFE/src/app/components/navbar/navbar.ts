import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // 👈 THÊM

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {

  user: any = null;

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    const data = localStorage.getItem("user");
    if (data) {
      this.user = JSON.parse(data);
    }
  }

  logout() {
    localStorage.removeItem("user");
    this.user = null;
  }
}