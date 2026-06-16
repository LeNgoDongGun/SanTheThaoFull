import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CourtService } from '../../services/court';
import { SporttypeService } from '../../services/sporttype';

@Component({
  selector: 'app-courts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './courts.html'
})
export class CourtsComponent implements OnInit {
  courts: any[] = [];
  allCourts: any[] = [];
  sportTypes: any[] = [];
  selectedSportId: number | null = null;
  selectedSport: any = null;
  keyword = '';
  loading = true;

  constructor(
    private courtService: CourtService,
    private sportTypeService: SporttypeService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    forkJoin({
      sportTypes: this.sportTypeService.getAll(),
      courts: this.courtService.getAll()
    }).subscribe(({ sportTypes, courts }) => {
      this.sportTypes = sportTypes;
      this.allCourts = courts;
      this.loading = false;
      this.applyFilter();
      this.cdr.detectChanges();
    });

    this.route.queryParams.subscribe(params => {
      this.selectedSportId = params['sportTypeId'] ? Number(params['sportTypeId']) : null;
      this.keyword = params['search'] || '';
      this.applyFilter();
      this.cdr.detectChanges();
    });
  }

  applyFilter() {
    this.selectedSport = this.sportTypes.find(s => s.id === this.selectedSportId) || null;
    this.courts = this.allCourts.filter(c =>
      (!this.selectedSportId || c.sportTypeId === this.selectedSportId) &&
      (!this.keyword || c.name.toLowerCase().includes(this.keyword.toLowerCase()))
    );
  }
}