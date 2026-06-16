import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ReviewService {
    private api = 'http://localhost:5135/api/reviews';
    constructor(private http: HttpClient) { }

    getByCourtId(courtId: number) {
        return this.http.get<any[]>(`${this.api}/court/${courtId}`);
    }

    create(review: any) {
        return this.http.post<any>(this.api, review);
    }
}