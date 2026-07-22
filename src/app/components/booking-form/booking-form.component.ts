import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.css'
})
export class BookingFormComponent {
  private readonly bookingService = inject(BookingService);
  private readonly toastService = inject(ToastService);

  // Property dropdown values loaded from service
  readonly properties = this.bookingService.properties;

  // Form close event notifier
  @Output() closeForm = new EventEmitter<void>();

  // Form Fields
  customerName = '';
  adults = 2;
  children = 0;
  checkInDate = this.bookingService.getTodayDateString();
  checkOutDate = '';
  totalPayment = 300;
  advanceAmount = 100;
  propertyName = this.properties[0]; // Default selection

  // Saving state to disable button during API call
  isSaving = false;

  // Calculated read-only balance payment
  get balancePayment(): number {
    return Math.max(0, this.totalPayment - this.advanceAmount);
  }

  // Cancel filling out details
  onCancel() {
    this.closeForm.emit();
  }

  // Handle Save
  async onSubmit(form: any) {
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

    this.isSaving = true;
    try {
      // Add booking via service (calls backend API)
      await this.bookingService.addBooking({
        customerName: this.customerName,
        propertyName: this.propertyName,
        adults:       Number(this.adults),
        children:     Number(this.children),
        checkInDate:  this.checkInDate,
        checkOutDate: this.checkOutDate,
        checkInTime:  '',
        totalPayment: Number(this.totalPayment),
        advanceAmount: Number(this.advanceAmount)
      });

      // Reset form to default state
      this.customerName  = '';
      this.adults        = 2;
      this.children      = 0;
      this.checkInDate   = this.bookingService.getTodayDateString();
      this.checkOutDate  = '';
      this.totalPayment  = 300;
      this.advanceAmount = 100;
      this.propertyName  = this.properties[0];

      this.closeForm.emit();
      this.toastService.success('Booking saved to database successfully!');
    } catch (err) {
      this.toastService.error('Failed to save booking. Please check the backend is running.');
    } finally {
      this.isSaving = false;
    }
  }
}

