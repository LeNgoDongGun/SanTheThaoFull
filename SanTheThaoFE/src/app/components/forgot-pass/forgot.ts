import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'forgot.html',
  styleUrl: 'forgot.css',
  // 1. Kích hoạt chiến lược OnPush
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  // 2. Inject ChangeDetectorRef để kích hoạt render thủ công
  private cdr = inject(ChangeDetectorRef); 

  email: string = '';
  newPassword: string = '';
  
  isEmailAvail: boolean = false; 
  isLoading: boolean = false;
  message: string = '';
  isError: boolean = false;

  checkEmailExists() {
    this.isLoading = true;
    this.message = ''; 
    // Không cần gọi markForCheck ở đây vì sự kiện click/submit từ UI 
    // đã tự kích hoạt Change Detection một lần rồi.

    this.authService.checkEmail(this.email).subscribe({
      next: (res: boolean) => {
        this.isLoading = false;
        
        if (res === true) {
          this.isEmailAvail = true; 
          this.showStatus('Email chính xác! Mời bạn nhập mật khẩu mới.', false);
        } else {
          this.isEmailAvail = false;
          this.showStatus('Email này không tồn tại trên hệ thống!', true);
        }
        
        // 3. Báo cho Angular vẽ lại vì dữ liệu bất đồng bộ đã về
        this.cdr.markForCheck(); 
      },
      error: (err) => {
        this.isLoading = false;
        this.showStatus('Lỗi kết nối server.', true);
        
        // 3. Báo cho Angular vẽ lại khi có lỗi
        this.cdr.markForCheck(); 
      }
    });
  }

  changePasswordDirect() {
    this.isLoading = true;

    this.authService.resetPasswordDirect(this.email, this.newPassword).subscribe({
      next: (res: boolean) => {
        this.isLoading = false;

        if (res === true) {
          this.showStatus('Đổi mật khẩu thành công!', false);
          this.newPassword = ''; 
          // reset thẻ input có 
          this.email = '';
          this.isEmailAvail = false; 
        } else {
          this.showStatus('Đổi mật khẩu thất bại. Vui lòng thử lại!', true);
        }
        
        // 4. Báo cho Angular vẽ lại
        this.cdr.markForCheck(); 
      },
      error: (err) => {
        this.isLoading = false;
        this.showStatus('Lỗi hệ thống khi đổi mật khẩu.', true);
        
        // 4. Báo cho Angular vẽ lại
        this.cdr.markForCheck(); 
      }
    });
  }

  private showStatus(msg: string, err: boolean) {
    this.message = msg;
    this.isError = err;
  }
}