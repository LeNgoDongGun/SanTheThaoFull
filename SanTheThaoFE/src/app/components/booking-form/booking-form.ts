import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourtService } from '../../services/court';
import { BookingService, BookingRequest } from '../../services/booking';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './booking-form.html', 
  styleUrls: ['./booking-form.css']   
})
export class BookingFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courtService = inject(CourtService);
  private bookingService = inject(BookingService);
  public auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  court: any = null;
  
  // Model đồng bộ dữ liệu với Form HTML
  bookingData = {
    bookingDate: '',
    startTime: '',
    endTime: '',
    note: '',
    paymentMethod: 'Cash' as 'Cash' | 'Momo', 
    totalPrice: 0
  };

  today = new Date().toISOString().split('T')[0];
  loading = false;
  errorMsg = '';
  courtId = 0;

  ngOnInit() {
    this.courtId = Number(this.route.snapshot.paramMap.get('courtId'));
    
    this.courtService.getById(this.courtId).subscribe({
      next: (res: any) => {
        this.court = res.data ?? res;
        this.cdr.detectChanges();
      }
    });
  }

  calcPrice() {
    if (!this.bookingData.startTime || !this.bookingData.endTime || !this.court) return;
    const [sh, sm] = this.bookingData.startTime.split(':').map(Number);
    const [eh, em] = this.bookingData.endTime.split(':').map(Number);
    const hours = (eh * 60 + em - sh * 60 - sm) / 60;
    this.bookingData.totalPrice = hours > 0 ? hours * this.court.pricePerHour : 0;
  }

  submit() {
    if (!this.bookingData.bookingDate || !this.bookingData.startTime || !this.bookingData.endTime) {
      this.errorMsg = 'Vui lòng điền đầy đủ thông tin.';
      return;
    }
    if (this.bookingData.totalPrice <= 0) {
      this.errorMsg = 'Giờ kết thúc phải sau giờ bắt đầu.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    // Đóng gói dữ liệu dựa trên Interface BookingRequest của file booking.ts
    const payload: BookingRequest = {
      courtId: this.courtId,
      userId: this.auth.getUser()?.id || 0,
      bookingDate: this.bookingData.bookingDate,
      startTime: this.bookingData.startTime,
      endTime: this.bookingData.endTime,
      note: this.bookingData.note,
      paymentMethod: this.bookingData.paymentMethod
    };

    this.bookingService.create(payload).subscribe({
      next: (res: any) => {
        this.loading = false; // Tắt trạng thái loading khi có phản hồi thành công từ API
        
        // LUỒNG 1: Nếu chọn MoMo và Backend trả về link thanh toán online thành công
        if (payload.paymentMethod === 'Momo' && res.payUrl) {
          window.location.href = res.payUrl; // Chuyển hướng trình duyệt sang trang MoMo quét mã
        } 
        // LUỒNG 2: Thanh toán tiền mặt tại quầy -> Chuyển sang trang kết quả nội bộ báo ăn ngay
        else {
          this.router.navigate(['/booking-result'], { 
            queryParams: { status: 'success', method: 'Cash' } 
          });
        }
      },
      error: (err: any) => {
        this.loading = false; // Nhả nút bấm ra, không để form bị đóng băng khi dính lỗi
        console.error('Lỗi hệ thống đặt sân:', err);
        
        // Đọc câu thông báo lỗi chi tiết từ Backend gửi về nếu có
        this.errorMsg = err?.error?.message || 'Không thể kết nối đến server (Mã lỗi: ' + err.status + ')';
      }
    });
  }
}