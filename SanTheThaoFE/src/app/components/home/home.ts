import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CourtService } from '../../services/court';
import { SporttypeService } from '../../services/sporttype';
import { NewsService } from '../../services/news';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit {
  courts: any[] = [];
  sportTypes: any[] = [];
  news: any[] = [];

  constructor(
    private courtService: CourtService,
    private sportTypeService: SporttypeService,
    private newsService: NewsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    forkJoin({
      sportTypes: this.sportTypeService.getAll(),
      courts: this.courtService.getAll(),
      news: this.newsService.getAll()
    }).subscribe(({ sportTypes, courts, news }) => {
      this.sportTypes = sportTypes;
      this.courts = courts
        .sort((a: any, b: any) => (b.bookings?.length || 0) - (a.bookings?.length || 0))
        .slice(0, 4);
      this.news = news.slice(0, 4);
      this.cdr.detectChanges();
    });
  }
}