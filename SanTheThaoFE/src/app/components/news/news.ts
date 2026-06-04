import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NewsService } from '../../services/news';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="max-width:1000px;margin:auto;padding:32px 24px">
      <h2 style="font-weight:700;margin-bottom:20px">📰 Tin tức thể thao</h2>

      <!-- Filter danh mục -->
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px">
        <button (click)="filterBy(null)"
                [style.background]="!selectedCategory ? '#3b82f6' : '#f1f5f9'"
                [style.color]="!selectedCategory ? 'white' : '#475569'"
                style="padding:8px 18px;border-radius:20px;border:none;cursor:pointer;font-size:0.875rem;font-weight:500">
          Tất cả
        </button>
        <button *ngFor="let cat of categories"
                (click)="filterBy(cat)"
                [style.background]="selectedCategory === cat ? '#3b82f6' : '#f1f5f9'"
                [style.color]="selectedCategory === cat ? 'white' : '#475569'"
                style="padding:8px 18px;border-radius:20px;border:none;cursor:pointer;font-size:0.875rem;font-weight:500">
          {{ cat }}
        </button>
      </div>

      <p *ngIf="loading" style="text-align:center;color:#64748b;padding:40px">Đang tải...</p>

      <div *ngIf="!loading && posts.length === 0"
           style="text-align:center;padding:60px;color:#64748b">
        <div style="font-size:3rem">📰</div>
        <p>Chưa có bài viết nào.</p>
      </div>

      <!-- Danh sách bài viết -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px">
        <div *ngFor="let post of posts"
             style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08)">

          <div style="height:160px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);overflow:hidden;display:flex;align-items:center;justify-content:center">
            <img *ngIf="post.thumbnailUrl" [src]="post.thumbnailUrl" [alt]="post.title"
                 style="width:100%;height:100%;object-fit:cover" (error)="post.thumbnailUrl=null">
            <span *ngIf="!post.thumbnailUrl" style="font-size:3rem">📰</span>
          </div>

          <div style="padding:16px">
            <span style="background:#eff6ff;color:#3b82f6;padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600">
              {{ post.category }}
            </span>
            <h3 style="margin:10px 0 6px;font-size:0.95rem;font-weight:700;line-height:1.4">
              {{ post.title }}
            </h3>
            <p style="margin:0 0 14px;color:#64748b;font-size:0.85rem;line-height:1.5">
              {{ post.summary?.slice(0, 100) }}{{ post.summary?.length > 100 ? '...' : '' }}
            </p>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:0.78rem;color:#94a3b8">
                {{ post.createdAt | date:'dd/MM/yyyy' }}
              </span>
              <a [routerLink]="['/news', post.id]"
                 style="color:#3b82f6;font-size:0.85rem;font-weight:600;text-decoration:none">
                Đọc thêm →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NewsComponent implements OnInit {
  posts: any[] = [];
  allPosts: any[] = [];
  categories: string[] = [];
  selectedCategory: string | null = null;
  loading = true;

  constructor(
    private newsService: NewsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.newsService.getAll().subscribe({
      next: (res: any) => {
        this.allPosts = Array.isArray(res) ? res : (res.data || []);
        this.posts = this.allPosts;
        this.categories = [...new Set(this.allPosts.map((p: any) => p.category))];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  filterBy(cat: string | null) {
    this.selectedCategory = cat;
    this.posts = cat ? this.allPosts.filter(p => p.category === cat) : this.allPosts;
    this.cdr.detectChanges();
  }
}