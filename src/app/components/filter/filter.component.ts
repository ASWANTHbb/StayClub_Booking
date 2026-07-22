import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FilterCriteria {
  customerName: string;
  checkInDate: string;
}

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent {
  customerName = '';
  checkInDate = '';

  @Output() filterChanged = new EventEmitter<FilterCriteria>();

  onSearch() {
    this.filterChanged.emit({
      customerName: this.customerName.trim(),
      checkInDate: this.checkInDate
    });
  }

  onReset() {
    this.customerName = '';
    this.checkInDate = '';
    this.filterChanged.emit({
      customerName: '',
      checkInDate: ''
    });
  }
}
