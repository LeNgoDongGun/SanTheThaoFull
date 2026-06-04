import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Booking } from '../models/court.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = 'http://localhost:5135/api/bookings';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  create(booking: Booking): Observable<any> {
    return this.http.post(this.apiUrl, booking);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  update(id: number, booking: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, booking);
  }
}