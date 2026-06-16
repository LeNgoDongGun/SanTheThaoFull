import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Court } from '../models/court.model';

@Injectable({ providedIn: 'root' })
export class CourtService {
  private apiUrl = 'http://localhost:5135/api/courts';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Court[]> {
    return this.http.get<Court[]>(this.apiUrl);
  }

  getById(id: number): Observable<Court> {
    return this.http.get<Court>(`${this.apiUrl}/${id}`);
  }

  create(court: Court): Observable<Court> {
    return this.http.post<Court>(this.apiUrl, court);
  }

  update(id: number, court: Court): Observable<Court> {
    return this.http.put<Court>(`${this.apiUrl}/${id}`, court);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}