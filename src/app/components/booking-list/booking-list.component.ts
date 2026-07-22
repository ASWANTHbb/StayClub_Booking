import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Booking } from '../../models/booking.model';
import { BookingCardComponent } from '../booking-card/booking-card.component';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [NgFor, NgIf, BookingCardComponent],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css'
})
export class BookingListComponent {
  @Input({ required: true }) bookings: Booking[] = [];
  @Output() bookingClick = new EventEmitter<Booking>();
}
