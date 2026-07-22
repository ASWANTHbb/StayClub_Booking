import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-booking-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-booking-page.component.html',
  styleUrl: './add-booking-page.component.css'
})
export class AddBookingPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly toastService = inject(ToastService);

  propertyName = '';
  propertySlug = '';
  bookingId = '';
  isEditMode = false;

  customerName = '';
  numberOfGuests = 2;
  checkInDate = this.bookingService.getTodayDateString();
  checkOutDate = '2026-07-15';
  totalPayment = 0;
  advanceAmount = 0;
  checkInTime = '';

  get pendingPayment(): number {
    return Math.max(0, this.totalPayment - this.advanceAmount);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.propertySlug = params.get('name') || '';
      this.bookingId = params.get('id') || '';
      this.isEditMode = !!this.bookingId;

      const matched = this.bookingService.properties.find(
        p => this.slugify(p) === this.propertySlug
      ) || this.propertySlug;
      this.propertyName = matched;

      if (this.isEditMode) {
        const booking = this.bookingService.getBookingById(this.bookingId);
        if (booking) {
          this.customerName = booking.customerName;
          this.numberOfGuests = booking.adults + booking.children;
          this.checkInDate = booking.checkInDate;
          this.checkOutDate = booking.checkOutDate;
          this.totalPayment = booking.totalPayment;
          this.advanceAmount = booking.advanceAmount;
          this.checkInTime = booking.checkInTime || '';
        }
      }
    });
  }

  async onSubmit(form: NgForm) {
    if (form.invalid) {
      this.toastService.error('Please fill out all required fields.');
      return;
    }

    if (this.checkInDate && this.checkOutDate) {
      const inDate = new Date(this.checkInDate);
      const outDate = new Date(this.checkOutDate);
      if (outDate <= inDate) {
        this.toastService.error('Check-out date must be greater than Check-in date.');
        return;
      }
    } else {
      this.toastService.error('Check-in and Check-out dates are required.');
      return;
    }

    const bookingData = {
      customerName: this.customerName,
      propertyName: this.propertyName,
      adults: Number(this.numberOfGuests),
      children: 0,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      totalPayment: Number(this.totalPayment),
      advanceAmount: Number(this.advanceAmount),
      checkInTime: this.checkInTime || undefined
    };

    try {
      if (this.isEditMode) {
        await this.bookingService.updateBooking(this.bookingId, bookingData);
        this.toastService.success('Booking updated successfully.');
      } else {
        await this.bookingService.addBooking(bookingData);
        this.toastService.success('Booking added successfully.');
      }
      this.router.navigate(['/property', this.propertySlug]);
    } catch (err: any) {
      this.toastService.error('Failed to save booking. Please check if backend is running.');
    }
  }

  async onDelete() {
    if (!this.isEditMode) return;

    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        await this.bookingService.deleteBooking(this.bookingId);
        this.toastService.success('Booking deleted successfully.');
        this.router.navigate(['/property', this.propertySlug]);
      } catch (err: any) {
        this.toastService.error('Failed to delete booking.');
      }
    }
  }

  onCancel() {
    this.router.navigate(['/property', this.propertySlug]);
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/['\s]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
