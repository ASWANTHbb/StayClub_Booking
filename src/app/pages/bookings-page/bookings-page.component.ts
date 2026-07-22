import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { ToastService } from '../../services/toast.service';
import { FilterComponent, FilterCriteria } from '../../components/filter/filter.component';
import { BookingListComponent } from '../../components/booking-list/booking-list.component';
import { BookingFormComponent } from '../../components/booking-form/booking-form.component';

@Component({
  selector: 'app-bookings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FilterComponent,
    BookingListComponent,
    BookingFormComponent
  ],
  templateUrl: './bookings-page.component.html',
  styleUrl: './bookings-page.component.css'
})
export class BookingsPageComponent {
  private readonly bookingService = inject(BookingService);
  private readonly toastService = inject(ToastService);

  // Local signal for active filters
  private readonly filterCriteria = signal<FilterCriteria>({ customerName: '', checkInDate: '' });

  // Control state for booking details form modal
  readonly isFormOpen = signal<boolean>(false);

  // Export modal state
  readonly isExportModalOpen = signal<boolean>(false);
  exportFromDate = '';
  exportToDate = '';

  // Computed filtered bookings list
  readonly filteredBookings = computed(() => {
    const all = this.bookingService.bookings();
    const criteria = this.filterCriteria();

    return all.filter(booking => {
      const matchName = !criteria.customerName ||
        booking.customerName.toLowerCase().includes(criteria.customerName.toLowerCase());

      const matchDate = !criteria.checkInDate ||
        booking.checkInDate === criteria.checkInDate;

      return matchName && matchDate;
    });
  });

  // Handle filters from the filter component
  onFilterChanged(criteria: FilterCriteria) {
    this.filterCriteria.set(criteria);
  }

  // Modal control
  openForm() {
    this.isFormOpen.set(true);
  }

  closeForm() {
    this.isFormOpen.set(false);
  }

  // Export modal control
  openExportModal() {
    this.exportFromDate = '';
    this.exportToDate = '';
    this.isExportModalOpen.set(true);
  }

  closeExportModal() {
    this.isExportModalOpen.set(false);
  }

  confirmExport() {
    if (!this.exportFromDate || !this.exportToDate) {
      this.toastService.warning('Please select both From Date and To Date for export.');
      return;
    }

    const all = this.filteredBookings();
    const toExport = all.filter(b => {
      const date = b.checkInDate;
      return date >= this.exportFromDate && date <= this.exportToDate;
    });

    if (toExport.length === 0) {
      this.toastService.info('No bookings found in the selected date range.');
      return;
    }

    this.bookingService.exportToExcel(toExport, this.exportFromDate, this.exportToDate);
    this.closeExportModal();
    this.toastService.success('Booking Excel exported successfully');
  }
}