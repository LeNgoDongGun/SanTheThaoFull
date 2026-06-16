import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourtService } from '../../services/court';
import { ReviewService } from '../../services/review';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-court-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './court-detail.html'
})
export class CourtDetailComponent implements OnInit {
  court: any = null;
  reviews: any[] = [];
  loading = true;
  reviewMsg = '';
  courtId = 0;
  newReview = { courtId: 0, rating: 5, comment: '', userName: '' };

  constructor(
    private route: ActivatedRoute,
    private courtService: CourtService,
    private reviewService: ReviewService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.courtId = Number(this.route.snapshot.paramMap.get('id'));
    this.newReview.courtId = this.courtId;

    this.courtService.getById(this.courtId).subscribe(court => {
      this.court = court;
      this.loading = false;
      this.cdr.detectChanges();
    });

    this.loadReviews();
  }

  loadReviews() {
    this.reviewService.getByCourtId(this.courtId).subscribe(reviews => {
      this.reviews = reviews;
      this.cdr.detectChanges();
    });
  }

  submitReview() {
    if (!this.newReview.comment.trim()) return;
    this.reviewService.create(this.newReview).subscribe(() => {
      this.reviewMsg = '✅ Đánh giá đã được gửi!';
      this.newReview = { courtId: this.courtId, rating: 5, comment: '', userName: '' };
      this.loadReviews();
      setTimeout(() => this.reviewMsg = '', 3000);
    });
  }
}