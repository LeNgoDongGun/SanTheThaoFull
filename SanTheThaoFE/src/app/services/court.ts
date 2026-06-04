import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Court } from '../models/court.model';

@Injectable({ providedIn: 'root' })
export class CourtService {
  private apiUrl = 'http://localhost:5135/api/courts';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(court: Court): Observable<any> {
    return this.http.post(this.apiUrl, court);
  }

  update(id: number, court: Court): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, court);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}