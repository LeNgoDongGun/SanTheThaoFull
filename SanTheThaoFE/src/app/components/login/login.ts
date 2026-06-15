import { Component, OnInit } from '@angular/core'; // Thêm OnInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router'; // Thêm ActivatedRoute
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit { // Implement OnInit
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(
    private auth: AuthService, 
    private router: Router,
    private route: ActivatedRoute // Inject ActivatedRoute vào đây
  ) { }

  ngOnInit() {
    // --- XỬ LÝ ĐĂNG NHẬP MXH TRẢ VỀ QUA QUERY PARAMS ---
      // Hứng dữ liệu từ .NET Redirect trả về qua Query Parameters
      this.route.queryParams.subscribe(params => {
        if (params['socialLogin'] === 'true') {
          this.loading = true;
          
          // Tạo object user từ các tham số nhận trên URL
          const userObj = {
            id: params['id'] ? +params['id'] : null,
            email: params['email'],
            fullName: params['fullName'] ? decodeURIComponent(params['fullName']) : '',
            role: params['role']
          };

          // 1. Lưu thông tin đăng nhập vào localStorage
          this.auth.saveUser(userObj);

          // 2. TỐI ƯU UX: Xóa sạch query params trên thanh URL để giữ bảo mật và sạch sẽ
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { socialLogin: null, id: null, email: null, fullName: null, role: null },
            queryParamsHandling: 'merge' // Gộp đè giá trị null để xóa chúng đi
          }).then(() => {
            // 3. Sau khi URL đã sạch, tiến hành đá về trang chủ
            this.loading = false;
            this.router.navigate(['/']);
          });
        }
      });
    }

  submit() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Vui lòng nhập đầy đủ email và mật khẩu.';
      return;
    }
    
    this.loading = true;
    this.errorMsg = '';
    
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => this.handleSuccess(res),
      error: () => this.handleError('Email hoặc mật khẩu không đúng.')
    });
  }

  // --- CÁC HÀM XỬ LÝ ĐĂNG NHẬP MXH ĐÃ ĐƯỢC TỐI ƯU ---

  loginWithGoogle() {
    this.loading = true;
    this.errorMsg = '';
    this.auth.loginSocial('google'); // Gọi trực tiếp, không .subscribe()
  }

  loginWithFacebook() {
    this.loading = true;
    this.errorMsg = '';
    this.auth.loginSocial('facebook'); // Gọi trực tiếp, không .subscribe()
  }

  loginWithGithub() {
    this.loading = true;
    this.errorMsg = '';
    this.auth.loginSocial('github'); // Gọi trực tiếp, không .subscribe()
  }

  // Hàm helper để tái sử dụng code xử lý kết quả
  private handleSuccess(res: any) {
    this.auth.saveUser(res.data ?? res);
    this.loading = false;
    this.router.navigate(['/']);
  }

  private handleError(msg: string) {
    this.loading = false;
    this.errorMsg = msg;
  }
}