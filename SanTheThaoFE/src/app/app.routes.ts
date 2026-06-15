import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { CourtsComponent } from './components/courts/courts';
import { CourtDetailComponent } from './components/court-detail/court-detail';
import { BookingFormComponent } from './components/booking-form/booking-form';
import { BookingResultComponent } from './booking-result/booking-result';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { MyBookingsComponent } from './components/my-bookings/my-bookings';
import { NewsComponent } from './components/news/news';
import { NewsDetailComponent } from './components/news-detail/news-detail';
import { AdminComponent } from './components/admin/admin';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'courts', component: CourtsComponent },
    { path: 'courts/:id', component: CourtDetailComponent },
    { path: 'booking/:courtId', component: BookingFormComponent },
    // SỬA THÀNH COMPONENT THUẦN VÀ THÊM DẤU PHẨY ĐẦY ĐỦ Ở CUỐI DÒNG
    { path: 'booking-result', component: BookingResultComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'my-bookings', component: MyBookingsComponent },
    { path: 'news', component: NewsComponent },
    { path: 'news/:id', component: NewsDetailComponent },
    { path: 'admin', component: AdminComponent },
    { path: '**', redirectTo: '' }
];