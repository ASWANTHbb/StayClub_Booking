import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PropertyPageComponent } from './pages/property-page/property-page.component';
import { TodayBookingsPageComponent } from './pages/today-bookings-page/today-bookings-page.component';
import { AddBookingPageComponent } from './pages/add-booking-page/add-booking-page.component';
import { AddExpensePageComponent } from './pages/add-expense-page/add-expense-page.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'today-bookings', component: TodayBookingsPageComponent },
  { path: 'property/:name', component: PropertyPageComponent },
  { path: 'property/:name/add-booking', component: AddBookingPageComponent },
  { path: 'property/:name/booking/:id', component: AddBookingPageComponent },
  { path: 'property/:name/add-expense', component: AddExpensePageComponent },
  { path: 'property/:name/expense/:id', component: AddExpensePageComponent },
  { path: '**', redirectTo: '' }
];
