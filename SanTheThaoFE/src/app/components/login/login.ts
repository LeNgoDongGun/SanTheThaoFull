import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  email = ''; password = ''; loading = false; errorMsg = '';

  socials = [
    { id: 'google' as const, name: 'Google', icon: 'https://img.icons8.com/?size=100&id=4hR4Ih04Je2t&format=png&color=000000' },
    { id: 'facebook' as const, name: 'Facebook', icon: 'https://img.icons8.com/?size=100&id=118497&format=png&color=000000' },
    { id: 'github' as const, name: 'Github', icon: 'https://img.icons8.com/?size=100&id=62856&format=png&color=000000' }
  ];

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['socialLogin'] !== 'true') return;
      this.loading = true;

      this.auth.saveUser({
        id: p['id'] ? +p['id'] : null,
        email: p['email'] || '',
        fullName: p['fullName'] ? decodeURIComponent(p['fullName']) : '',
        role: p['role'] || ''
      });

      this.router.navigate(['/'], {
        queryParams: { socialLogin: null, id: null, email: null, fullName: null, role: null },
        queryParamsHandling: 'merge'
      }).then(() => this.loading = false);
    });
  }

  submit() {
    this.loading = true; this.errorMsg = '';
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (res: any) => {
        this.auth.saveUser(res.data || res);
        this.router.navigate(['/']);
      },
      error: () => { this.loading = false; this.errorMsg = 'Email hoặc mật khẩu không đúng.'; }
    });
  }

  loginWithSocial(provider: 'google' | 'facebook' | 'github') {
    this.loading = true; this.errorMsg = '';
    this.auth.loginSocial(provider);
  }
}