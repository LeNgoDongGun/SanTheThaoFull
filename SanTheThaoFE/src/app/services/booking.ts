import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface đóng gói dữ liệu gửi lên API .NET
export interface BookingRequest {
  courtId: number;
  userId: number;       
  bookingDate: string;  // Định dạng chuỗi: "YYYY-MM-DD"
  startTime: string;    // Định dạng chuỗi: "HH:mm"
  endTime: string;      // Định dạng chuỗi: "HH:mm"
  note?: string;        
  paymentMethod: 'Cash' | 'Momo'; 
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = 'http://localhost:5135/api/bookings';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Bắn chuẩn vào endpoint /create của Backend
  create(booking: BookingRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, booking);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  update(id: number, booking: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, booking);
  }
}