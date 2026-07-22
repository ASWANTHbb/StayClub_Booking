import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { ExpenseService } from '../../services/expense.service';
import { ToastService } from '../../services/toast.service';
import { FilterComponent, FilterCriteria } from '../../components/filter/filter.component';
import { BookingListComponent } from '../../components/booking-list/booking-list.component';
import { PropertyStats, Booking, Expense } from '../../models/booking.model';

@Component({
  selector: 'app-property-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    FilterComponent,
    BookingListComponent
  ],
  templateUrl: './property-page.component.html',
  styleUrl: './property-page.component.css'
})
export class PropertyPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly expenseService = inject(ExpenseService);
  private readonly toastService = inject(ToastService);

  private routeSub?: Subscription;

  readonly propertyName = signal<string>('');
  readonly propertySlug = signal<string>('');

  private readonly filterCriteria = signal<FilterCriteria>({ customerName: '', checkInDate: '' });

  // Expense management state
  readonly expenses = signal<Expense[]>([]);
  readonly totalExpense = computed(() => {
    return this.expenses().reduce((sum, exp) => sum + exp.amount, 0);
  });

  // Expense modal form state
  readonly isExpenseModalOpen = signal<boolean>(false);
  readonly isEditingExpense = signal<boolean>(false);
  currentExpenseId = '';
  expenseAmount = 0;
  expenseDescription = '';
  expenseDate = '';

  // Export date range modal state
  readonly isExportModalOpen = signal<boolean>(false);
  readonly isExpenseExportModalOpen = signal<boolean>(false);
  readonly isBookingExportModalOpen = signal<boolean>(false);
  exportFromDate = '';
  exportToDate = '';
  expenseExportFromDate = '';
  expenseExportToDate = '';
  bookingExportFromDate = '';
  bookingExportToDate = '';

  readonly stats = computed<PropertyStats | null>(() => {
    const name = this.propertyName();
    if (!name) return null;
    return this.bookingService.getPropertyStats(name);
  });

  readonly allPropertyBookings = computed<Booking[]>(() => {
    const name = this.propertyName();
    if (!name) return [];
    return this.bookingService.getPropertyBookings(name);
  });

  readonly filteredBookings = computed<Booking[]>(() => {
    const all = this.allPropertyBookings();
    const criteria = this.filterCriteria();

    return all.filter(booking => {
      const matchName = !criteria.customerName ||
        booking.customerName.toLowerCase().includes(criteria.customerName.toLowerCase());

      const matchDate = !criteria.checkInDate ||
        booking.checkInDate === criteria.checkInDate;

      return matchName && matchDate;
    });
  });

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const slug = params.get('name') || '';
      this.propertySlug.set(slug);

      const matched = this.bookingService.properties.find(
        p => this.slugify(p) === slug
      ) || slug;

      this.propertyName.set(matched);
      this.filterCriteria.set({ customerName: '', checkInDate: '' });
      this.loadExpenses(matched);
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  onFilterChanged(criteria: FilterCriteria) {
    this.filterCriteria.set(criteria);
  }

  // Load expenses for selected property
  loadExpenses(propName: string) {
    this.expenseService.getExpensesByProperty(propName).subscribe({
      next: (data) => {
        this.expenses.set(data);
      },
      error: (err) => {
        console.error('Failed to load expenses:', err);
        this.toastService.error('Failed to load expenses');
      }
    });
  }

  // Expense Modal Handlers
  openAddExpenseModal() {
    this.isEditingExpense.set(false);
    this.currentExpenseId = '';
    this.expenseAmount = 0;
    this.expenseDescription = '';
    this.expenseDate = this.bookingService.getTodayDateString();
    this.isExpenseModalOpen.set(true);
  }

  openEditExpenseModal(expense: Expense) {
    this.isEditingExpense.set(true);
    this.currentExpenseId = expense.id;
    this.expenseAmount = expense.amount;
    this.expenseDescription = expense.description;
    this.expenseDate = expense.date;
    this.isExpenseModalOpen.set(true);
  }

  closeExpenseModal() {
    this.isExpenseModalOpen.set(false);
  }

  saveExpense() {
    if (!this.expenseDescription || this.expenseAmount <= 0 || !this.expenseDate) {
      this.toastService.error('Please fill out all fields correctly.');
      return;
    }

    const payload = {
      propertyName: this.propertyName(),
      amount: this.expenseAmount,
      description: this.expenseDescription,
      date: this.expenseDate
    };

    if (this.isEditingExpense()) {
      this.expenseService.updateExpense(this.currentExpenseId, payload).subscribe({
        next: (updated) => {
          this.expenses.update(list => list.map(e => e.id === updated.id ? updated : e));
          this.closeExpenseModal();
          this.toastService.success('Expense updated successfully');
        },
        error: (err) => {
          this.toastService.error('Failed to update expense: ' + (err.error?.message || err.message));
        }
      });
    } else {
      this.expenseService.addExpense(payload).subscribe({
        next: (newExp) => {
          this.expenses.update(list => [newExp, ...list]);
          this.closeExpenseModal();
          this.toastService.success('Expense added successfully');
        },
        error: (err) => {
          this.toastService.error('Failed to add expense: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  deleteExpense(id: string) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          this.expenses.update(list => list.filter(e => e.id !== id));
          this.toastService.success('Expense deleted successfully');
        },
        error: (err) => {
          this.toastService.error('Failed to delete expense: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  // Booking export modal handlers
  openBookingExportModal() {
    this.bookingExportFromDate = '';
    this.bookingExportToDate = '';
    this.isBookingExportModalOpen.set(true);
  }

  closeBookingExportModal() {
    this.isBookingExportModalOpen.set(false);
  }

  confirmBookingExport() {
    if (!this.bookingExportFromDate || !this.bookingExportToDate) {
      this.toastService.warning('Please select both From Date and To Date for export.');
      return;
    }
    const all = this.filteredBookings();
    const toExport = all.filter(b => {
      const date = b.checkInDate;
      return date >= this.bookingExportFromDate && date <= this.bookingExportToDate;
    });

    if (toExport.length === 0) {
      this.toastService.info('No bookings found in the selected date range.');
      return;
    }

    this.bookingService.exportToExcel(toExport, this.bookingExportFromDate, this.bookingExportToDate);
    this.closeBookingExportModal();
    this.toastService.success('Booking Excel exported successfully');
  }

  // Expense export modal handlers
  openExpenseExportModal() {
    this.expenseExportFromDate = '';
    this.expenseExportToDate = '';
    this.isExpenseExportModalOpen.set(true);
  }

  closeExpenseExportModal() {
    this.isExpenseExportModalOpen.set(false);
  }

  confirmExpenseExport() {
    if (!this.expenseExportFromDate || !this.expenseExportToDate) {
      this.toastService.warning('Please select both From Date and To Date for export.');
      return;
    }

    const all = this.expenses();
    const toExport = all.filter(e => {
      const date = e.date;
      return date >= this.expenseExportFromDate && date <= this.expenseExportToDate;
    });

    if (toExport.length === 0) {
      this.toastService.info('No expenses found in the selected date range.');
      return;
    }

    this.expenseService.exportToExcel(toExport, this.propertyName(), this.expenseExportFromDate, this.expenseExportToDate);
    this.closeExpenseExportModal();
    this.toastService.success('Expense Excel exported successfully');
  }

  navigateToAddBooking() {
    this.router.navigate(['/property', this.propertySlug(), 'add-booking']);
  }

  navigateToAddExpense() {
    this.router.navigate(['/property', this.propertySlug(), 'add-expense']);
  }

  onBookingClick(booking: Booking) {
    this.router.navigate(['/property', this.propertySlug(), 'booking', booking.id]);
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/['\s]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

