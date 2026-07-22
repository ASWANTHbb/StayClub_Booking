import { Component, inject } from '@angular/core';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private readonly bookingService = inject(BookingService);

  toggleSidebar() {
    this.bookingService.toggleSidebar();
  }
}
