import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-card.component.html',
  styleUrl: './booking-card.component.css'
})
export class BookingCardComponent {
  @Input({ required: true }) booking!: Booking;
  @Output() cardClick = new EventEmitter<Booking>();

  onCardClick() {
    this.cardClick.emit(this.booking);
  }
}
