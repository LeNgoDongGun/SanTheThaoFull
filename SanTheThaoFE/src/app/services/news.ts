import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NewsService {
    private api = 'http://localhost:5135/api/newsposts';
    constructor(private http: HttpClient) { }

    getAll(category?: string) {
        const url = category ? `${this.api}?category=${category}` : this.api;
        return this.http.get<any[]>(url);
    }

    getById(id: number) {
        return this.http.get<any>(`${this.api}/${id}`);
    }
}