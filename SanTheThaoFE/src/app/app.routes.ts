import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { CourtsComponent } from './components/courts/courts';
import { CourtDetailComponent } from './components/court-detail/court-detail';
import { BookingFormComponent } from './components/booking-form/booking-form';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'courts', component: CourtsComponent },
    { path: 'courts/:id', component: CourtDetailComponent },
    { path: 'booking/:courtId', component: BookingFormComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: '**', redirectTo: '' }
];