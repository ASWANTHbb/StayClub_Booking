import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { BookingService } from '../../services/booking.service';
import { ToastService } from '../../services/toast.service';
import { Expense } from '../../models/booking.model';

@Component({
  selector: 'app-add-expense-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-expense-page.component.html',
  styleUrl: './add-expense-page.component.css'
})
export class AddExpensePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly expenseService = inject(ExpenseService);
  private readonly bookingService = inject(BookingService);
  private readonly toastService = inject(ToastService);

  propertyName = '';
  propertySlug = '';
  expenseId = '';
  isEditMode = false;

  amount = 0;
  description = '';
  date = this.bookingService.getTodayDateString();

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.propertySlug = params.get('name') || '';
      this.expenseId = params.get('id') || '';
      this.isEditMode = !!this.expenseId;

      const matched = this.bookingService.properties.find(
        p => this.slugify(p) === this.propertySlug
      ) || this.propertySlug;
      this.propertyName = matched;

      if (this.isEditMode) {
        // Load expense by ID from API
        // For simplicity, we can load all expenses of property and find the matching one, 
        // or let's load it from property list or get it directly.
        // Let's fetch all expenses for this property and find the matching one.
        this.expenseService.getExpensesByProperty(this.propertyName).subscribe({
          next: (expenses) => {
            const exp = expenses.find(e => e.id === this.expenseId);
            if (exp) {
              this.amount = exp.amount;
              this.description = exp.description;
              this.date = exp.date;
            } else {
              this.toastService.error('Expense not found.');
              this.router.navigate(['/property', this.propertySlug]);
            }
          },
          error: (err) => {
            console.error('Failed to load expense for editing:', err);
            this.toastService.error('Failed to load expense data.');
            this.router.navigate(['/property', this.propertySlug]);
          }
        });
      }
    });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.toastService.error('Please fill out all required fields.');
      return;
    }

    const expenseData = {
      propertyName: this.propertyName,
      amount: Number(this.amount),
      description: this.description,
      date: this.date
    };

    if (this.isEditMode) {
      this.expenseService.updateExpense(this.expenseId, expenseData).subscribe({
        next: () => {
          this.toastService.success('Expense updated successfully.');
          this.router.navigate(['/property', this.propertySlug]);
        },
        error: (err) => {
          this.toastService.error('Failed to update expense: ' + (err.error?.message || err.message));
        }
      });
    } else {
      this.expenseService.addExpense(expenseData).subscribe({
        next: () => {
          this.toastService.success('Expense added successfully.');
          this.router.navigate(['/property', this.propertySlug]);
        },
        error: (err) => {
          this.toastService.error('Failed to add expense: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  onDelete() {
    if (!this.isEditMode) return;

    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(this.expenseId).subscribe({
        next: () => {
          this.toastService.success('Expense deleted successfully.');
          this.router.navigate(['/property', this.propertySlug]);
        },
        error: (err) => {
          this.toastService.error('Failed to delete expense: ' + (err.error?.message || err.message));
        }
      });
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
