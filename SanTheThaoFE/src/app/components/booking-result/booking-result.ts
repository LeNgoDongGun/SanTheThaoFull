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
    // Kiểm tra xem đây là luồng MoMo trả về hay luồng Tiền mặt chuyển sang
    this.route.queryParams.subscribe(params => {
      
      //  NẾU LÀ TỪ MOMO chuyển sang thì Check tham số resultCode từ MoMo gửi về để phân biệt thành công (bằng 0) hay thất bại.
      // momo chuyển tiếp sang trang này kèm query string 
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
      //NGược lại chuyển trực tiếp từ trang booking
      else {
        this.paymentMethod = params['method'] || 'Cash'; // kiểm tra xem có phương thức truyền vào k, nếu k thì gắn là cash
        this.isSuccess = params['status'] === 'success'; // Kiểm tra tham số status trên URL có trùng khớp hoàn toàn với chuỗi 'success' hay không
        this.message = this.isSuccess // nếu đúng thì trả về message hiện lên html
          ? 'Đặt sân thành công! Vui lòng thanh toán tiền mặt tại quầy khi đến nhận sân.' 
          : 'Đặt sân thất bại. Vui lòng kiểm tra lại khung giờ.';
      }

      this.loading = false;
    });
  }
}