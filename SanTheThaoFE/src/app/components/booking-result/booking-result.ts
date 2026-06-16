import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-booking-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking-result.html',
  styleUrls: ['./booking-result.css']
})
export class BookingResultComponent implements OnInit {
  private route = inject(ActivatedRoute);

  isSuccess = false;
  paymentMethod = 'Cash';
  message = '';
  loading = true;

  ngOnInit() {
    // 1. Kiểm tra xem đây là luồng MoMo trả về hay luồng Tiền mặt chuyển sang
    this.route.queryParams.subscribe(params => {
      
      // THƯƠNG LƯỢNG LUỒNG 1: MoMo trả kết quả về qua URL định dạng của họ
      if (params['resultCode'] !== undefined) {
        this.paymentMethod = 'Momo';
        const resultCode = Number(params['resultCode']);
        
        // Theo tài liệu MoMo: resultCode = 0 nghĩa là giao dịch thành công thành công
        if (resultCode === 0) {
          this.isSuccess = true;
          this.message = 'Thanh toán online qua ví MoMo thành công! Sân của bạn đã được giữ.';
        } else {
          this.isSuccess = false;
          this.message = params['message'] || 'Giao dịch bị hủy hoặc thanh toán thất bại.';
        }
      } 
      
      // THƯƠNG LƯỢNG LUỒNG 2: Tiền mặt chuyển hướng nội bộ từ booking-form sang
      else {
        this.paymentMethod = params['method'] || 'Cash';
        this.isSuccess = params['status'] === 'success';
        this.message = this.isSuccess 
          ? 'Đặt sân thành công! Vui lòng thanh toán tiền mặt tại quầy khi đến nhận sân.' 
          : 'Đặt sân thất bại. Vui lòng kiểm tra lại khung giờ.';
      }

      this.loading = false;
    });
  }
}