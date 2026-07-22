import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { ToastService } from '../../services/toast.service';
import { FilterComponent, FilterCriteria } from '../../components/filter/filter.component';
import { BookingListComponent } from '../../components/booking-list/booking-list.component';

@Component({
  selector: 'app-today-bookings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FilterComponent,
    BookingListComponent
  ],
  templateUrl: './today-bookings-page.component.html',
  styleUrl: './today-bookings-page.component.css'
})
export class TodayBookingsPageComponent {
  private readonly bookingService = inject(BookingService);
  private readonly toastService = inject(ToastService);

  readonly todayDateString = this.bookingService.getTodayDateString();

  private readonly filterCriteria = signal<FilterCriteria>({ customerName: '', checkInDate: '' });

  // Export modal state
  readonly isExportModalOpen = signal<boolean>(false);
  exportFromDate = '';
  exportToDate = '';

  readonly filteredTodayBookings = computed(() => {
    const todayList = this.bookingService.todayBookings();
    const criteria = this.filterCriteria();

    return todayList.filter(booking => {
      const matchName = !criteria.customerName ||
        booking.customerName.toLowerCase().includes(criteria.customerName.toLowerCase());

      const matchDate = !criteria.checkInDate ||
        booking.checkInDate === criteria.checkInDate;

      return matchName && matchDate;
    });
  });

  onFilterChanged(criteria: FilterCriteria) {
    this.filterCriteria.set(criteria);
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

    const all = this.filteredTodayBookings();
    const toExport = all.filter(b => {
      const date = b.checkInDate;
      return date >= this.exportFromDate && date <= this.exportToDate;
    });

    this.bookingService.exportToExcel(toExport, this.exportFromDate, this.exportToDate);
    this.closeExportModal();
  }
}

