import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);

  // Expose signals from service
  readonly stats = this.bookingService.dashboardStats;
  readonly todayBookings = this.bookingService.todayBookings;

  // Computed properties list with their individual statistics
  readonly propertyStatsList = computed(() => {
    return this.bookingService.properties.map(prop => 
      this.bookingService.getPropertyStats(prop)
    );
  });

  // Convert property name to URL-friendly slug
  slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/['\s]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Navigate to property details
  onPropertyClick(propertyName: string) {
    this.router.navigate(['/property', this.slugify(propertyName)]);
  }
}
