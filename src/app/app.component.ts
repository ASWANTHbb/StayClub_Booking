import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastComponent } from './components/toast/toast.component';
import { BookingService } from './services/booking.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Holiday Property Booking Management';
  private readonly bookingService = inject(BookingService);

  ngOnInit() {
    // Open sidebar by default on wider screens
    if (window.innerWidth > 768) {
      this.bookingService.sidebarOpen.set(true);
    } else {
      this.bookingService.sidebarOpen.set(false);
    }

    // Fetch all bookings from MongoDB Atlas backend
    this.bookingService.loadBookings();
  }
}
