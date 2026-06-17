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
  templateUrl: './booking-form.html'
})
export class BookingFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courtService = inject(CourtService);
  private bookingService = inject(BookingService);
  public auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  court: any = null;
  
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
      },
      error: (err) => {
        this.errorMsg = 'Không thể tải thông tin sân.';
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

    // Chuẩn hóa định dạng HH:mm:ss nếu backend .NET core yêu cầu khắt khe
    let sTime = this.bookingData.startTime;
    let eTime = this.bookingData.endTime;
    if (sTime.length === 5) sTime += ':00';
    if (eTime.length === 5) eTime += ':00';

    const payload: BookingRequest = {
      courtId: this.courtId,
      userId: this.auth.getUser()?.id || 0,
      bookingDate: this.bookingData.bookingDate,
      startTime: sTime,
      endTime: eTime,
      note: this.bookingData.note,
      paymentMethod: this.bookingData.paymentMethod
    };

     // tạo đơn hàng
    this.bookingService.create(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        
        // LUỒNG 1: Chọn MoMo và Backend trả về link thanh toán (Ví dụ: res.payUrl hoặc res.data.payUrl)
        const payUrl = res?.payUrl || res?.data?.payUrl;
        if (payload.paymentMethod === 'Momo' && payUrl) {
          //chuyển người dùng sang trang thanh toán
          window.location.href = payUrl; 
        } 
        // LUỒNG 2: Tiền mặt
        else {
          this.router.navigate(['/booking-result'], { 
            queryParams: { status: 'success', method: 'Cash' } 
          });
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Lỗi đặt sân:', err);
        this.errorMsg = err?.error?.message || 'Không thể kết nối đến server.';
        this.cdr.detectChanges();
      }
    });
  }
}