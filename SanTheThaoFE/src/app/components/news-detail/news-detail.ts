import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NewsService } from '../../services/news';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="max-width:800px;margin:auto;padding:32px 24px">

      <p *ngIf="loading" style="text-align:center;color:#64748b;padding:40px">Đang tải...</p>

      <ng-container *ngIf="post && !loading">
        <!-- Breadcrumb -->
        <div style="font-size:0.85rem;color:#64748b;margin-bottom:20px">
          <a routerLink="/" style="color:#3b82f6;text-decoration:none">Trang chủ</a> /
          <a routerLink="/news" style="color:#3b82f6;text-decoration:none">Tin tức</a> /
          <span>{{ post.title }}</span>
        </div>

        <!-- Category + Date -->
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px">
          <span style="background:#eff6ff;color:#3b82f6;padding:4px 12px;border-radius:12px;font-size:0.8rem;font-weight:600">
            {{ post.category }}
          </span>
          <span style="color:#94a3b8;font-size:0.85rem">
            {{ post.createdAt | date:'dd/MM/yyyy' }}
          </span>
        </div>

        <!-- Tiêu đề -->
        <h1 style="font-size:1.8rem;font-weight:800;line-height:1.3;margin-bottom:16px">
          {{ post.title }}
        </h1>

        <!-- Tóm tắt -->
        <p style="font-size:1.05rem;color:#475569;border-left:4px solid #3b82f6;padding-left:16px;margin-bottom:24px;line-height:1.7">
          {{ post.summary }}
        </p>

        <!-- Ảnh -->
        <div *ngIf="post.thumbnailUrl"
             style="border-radius:12px;overflow:hidden;margin-bottom:28px;max-height:400px">
          <img [src]="post.thumbnailUrl" [alt]="post.title"
               style="width:100%;object-fit:cover" (error)="post.thumbnailUrl=null">
        </div>

        <!-- Nội dung -->
        <div style="font-size:0.95rem;line-height:1.8;color:#334155;white-space:pre-wrap">
          {{ post.content }}
        </div>

        <!-- Quay lại -->
        <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e2e8f0">
          <a routerLink="/news"
             style="color:#3b82f6;text-decoration:none;font-weight:600;font-size:0.9rem">
            ← Quay lại tin tức
          </a>
        </div>
      </ng-container>

      <div *ngIf="!post && !loading" style="text-align:center;padding:60px;color:#64748b">
        <div style="font-size:3rem">📰</div>
        <p>Không tìm thấy bài viết.</p>
        <a routerLink="/news" style="color:#3b82f6;font-weight:600">← Quay lại</a>
      </div>
    </div>
  `
})
export class NewsDetailComponent implements OnInit {
  post: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.newsService.getById(id).subscribe({
      next: (res: any) => {
        this.post = res.data ?? res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }
}