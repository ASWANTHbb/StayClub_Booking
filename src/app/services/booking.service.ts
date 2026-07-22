import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Booking, PropertyStats, Expense } from '../models/booking.model';
import * as ExcelJS from 'exceljs';

// ─────────────────────────────────────────────────────────────
// Backend API URL — change port if your server runs elsewhere
// ─────────────────────────────────────────────────────────────
const API_URL = 'https://stayclub-booking-api.onrender.com/api/bookings';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly http = inject(HttpClient);

  // Hardcoded property list as requested
  readonly properties = [
    "River Vill'e",
    'Luna Nest',
    'Kent',
    "Pool Vill'e",
    'Nilgiri Paradise',
    'WoodHouse',
    'Container Home'
  ];

  // UI state for responsive sidebar drawer
  readonly sidebarOpen = signal<boolean>(false);

  // Raw bookings source signal — populated from MongoDB via loadBookings()
  private readonly _bookings = signal<Booking[]>([]);

  // Read-only signal exposure
  readonly bookings = this._bookings.asReadonly();

  // Loading and error state
  readonly isLoading = signal<boolean>(false);
  readonly loadError = signal<string>('');

  // Sidebar Controls
  toggleSidebar() {
    this.sidebarOpen.update(open => !open);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  // Helper function to get today's date formatted as YYYY-MM-DD
  getTodayDateString(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm   = String(today.getMonth() + 1).padStart(2, '0');
    const dd   = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // ─────────────────────────────────────────────────────────────
  // LOAD all bookings from backend
  // ─────────────────────────────────────────────────────────────
  async loadBookings(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');
    try {
      const data = await firstValueFrom(this.http.get<Booking[]>(API_URL));
      this._bookings.set(data);
    } catch (err: any) {
      console.error('Failed to load bookings:', err);
      this.loadError.set('Could not connect to backend. Is the server running?');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Dashboard Stats Computed Signal
  readonly dashboardStats = computed(() => {
    const list = this._bookings();
    const todayStr = this.getTodayDateString();

    const totalProperties    = this.properties.length;
    const totalBookings      = list.length;
    const todaysCheckIns     = list.filter(b => b.checkInDate === todayStr).length;
    const pendingPayments    = list.filter(b => b.balancePayment > 0).length;
    const completedPayments  = list.filter(b => b.balancePayment === 0).length;

    return {
      totalProperties,
      totalBookings,
      todaysCheckIns,
      pendingPayments,
      completedPayments
    };
  });

  // Get bookings scheduled for today
  readonly todayBookings = computed(() => {
    const list = this._bookings();
    const todayStr = this.getTodayDateString();
    return list.filter(b => b.checkInDate === todayStr);
  });

  // Calculate statistics for each property
  getPropertyStats(propertyName: string): PropertyStats {
    const list = this._bookings().filter(
      b => b.propertyName.toLowerCase() === propertyName.toLowerCase()
    );
    const todayStr = this.getTodayDateString();

    const todaysBookingsCount    = list.filter(b => b.checkInDate === todayStr).length;
    const totalBookingsCount     = list.length;
    const pendingPaymentsCount   = list.filter(b => b.balancePayment > 0).length;
    const completedPaymentsCount = list.filter(b => b.balancePayment === 0).length;

    const matchedProperty = this.properties.find(
      p => p.toLowerCase() === propertyName.toLowerCase()
    ) || propertyName;

    return {
      propertyName: matchedProperty,
      todaysBookingsCount,
      totalBookingsCount,
      pendingPaymentsCount,
      completedPaymentsCount
    };
  }

  // Get list of bookings for a specific property
  getPropertyBookings(propertyName: string): Booking[] {
    return this._bookings().filter(
      b => b.propertyName.toLowerCase() === propertyName.toLowerCase()
    );
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE a new booking — POST to backend, then refresh local list
  // ─────────────────────────────────────────────────────────────
  async addBooking(newBookingData: Omit<Booking, 'id' | 'balancePayment'>): Promise<string> {
    try {
      const saved = await firstValueFrom(
        this.http.post<Booking>(API_URL, newBookingData)
      );
      this._bookings.update(current => [saved, ...current]);
      return saved.id;
    } catch (err: any) {
      console.error('addBooking error:', err);
      throw err;
    }
  }

  getBookingById(id: string): Booking | undefined {
    return this._bookings().find(b => b.id === id);
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE a booking — PUT to backend, then update local signal
  // ─────────────────────────────────────────────────────────────
  async updateBooking(id: string, updatedData: Omit<Booking, 'id' | 'balancePayment'>): Promise<void> {
    try {
      const updated = await firstValueFrom(
        this.http.put<Booking>(`${API_URL}/${id}`, updatedData)
      );
      this._bookings.update(current =>
        current.map(b => b.id === id ? updated : b)
      );
    } catch (err: any) {
      console.error('updateBooking error:', err);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE a booking — DELETE from backend, then update local signal
  // ─────────────────────────────────────────────────────────────
  async deleteBooking(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${API_URL}/${id}`));
      this._bookings.update(current => current.filter(b => b.id !== id));
    } catch (err: any) {
      console.error('deleteBooking error:', err);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Excel styled exporter (using exceljs)
  // ─────────────────────────────────────────────────────────────
  exportToExcel(bookingsToExport: Booking[], fromDate?: string, toDate?: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bookings Report');

    // Force grid lines visibility
    worksheet.views = [{ showGridLines: true }];

    // 1. Add Title Block (styled with space and borders)
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'D2V BOOKINGS REPORT';
    titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2563EB' } // Brand blue #2563EB
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 40;

    // 2. Add Meta info
    worksheet.mergeCells('A2:F2');
    const metaCell = worksheet.getCell('A2');
    const dateRangeStr = (fromDate && toDate) ? `Period: ${fromDate} to ${toDate}` : 'Period: All Bookings';
    const propertyDetail = bookingsToExport.length > 0 ? bookingsToExport[0].propertyName : 'All Properties';
    metaCell.value = `Property: ${propertyDetail}   |   ${dateRangeStr}   |   Exported: ${new Date().toLocaleDateString()}`;
    metaCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: '475569' } };
    metaCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F8FAFC' }
    };
    metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 25;

    // Spacing row
    worksheet.addRow([]);
    worksheet.getRow(3).height = 15;

    // 3. Define Table Columns
    const headers = ['Guest Name', 'Property Name', 'Check-in Date', 'Check-out Date', 'Total Amount', 'Status'];
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 26;

    // Style headers
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E3A8A' } // Navy blue #1E3A8A
      };
      cell.alignment = { vertical: 'middle', horizontal: cell.address.startsWith('E') ? 'right' : 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: '94A3B8' } },
        left: { style: 'thin', color: { argb: '94A3B8' } },
        bottom: { style: 'medium', color: { argb: '1E293B' } },
        right: { style: 'thin', color: { argb: '94A3B8' } }
      };
    });

    // 4. Add data rows
    let totalRevenue = 0;
    bookingsToExport.forEach((b) => {
      const status = b.balancePayment === 0 ? 'COMPLETED' : `PENDING (₹${b.balancePayment})`;
      const dataRow = worksheet.addRow([
        b.customerName,
        b.propertyName,
        b.checkInDate,
        b.checkOutDate,
        b.totalPayment,
        status
      ]);
      dataRow.height = 22;
      totalRevenue += b.totalPayment;

      dataRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: '0F172A' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        };

        if (colNumber === 5) {
          cell.numFmt = '"₹"#,##0.00';
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        } else if (colNumber === 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          const isPaid = b.balancePayment === 0;
          cell.font = {
            name: 'Segoe UI',
            size: 9,
            bold: true,
            color: { argb: isPaid ? '15803D' : 'B91C1C' }
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isPaid ? 'DCFCE7' : 'FEE2E2' }
          };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });
    });

    // Spacing row
    const emptyRow2 = worksheet.addRow([]);
    emptyRow2.height = 10;

    // 5. Add Summary Footer
    const summaryRow = worksheet.addRow([
      'Total Bookings:',
      bookingsToExport.length,
      '',
      'Total Revenue:',
      totalRevenue,
      ''
    ]);
    summaryRow.height = 24;

    summaryRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '1E293B' } };
      if (colNumber === 1 || colNumber === 4) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else if (colNumber === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if (colNumber === 5) {
        cell.numFmt = '"₹"#,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: '15803D' } };
      }
    });

    // Merge footer styling columns
    worksheet.mergeCells(`B${summaryRow.number}:C${summaryRow.number}`);
    worksheet.mergeCells(`E${summaryRow.number}:F${summaryRow.number}`);

    // 6. Set custom column widths to fit content nicely
    worksheet.columns.forEach((col) => {
      let maxLen = 0;
      col.eachCell?.((cell) => {
        if ((cell.row as any) === 1 || (cell.row as any) === 2) return;
        const val = cell.value ? String(cell.value) : '';
        if (val.length > maxLen) maxLen = val.length;
      });
      col.width = Math.max(maxLen + 4, 15);
    });

    // Write buffer and trigger browser download
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');

      let filename: string;
      if (fromDate || toDate) {
        const fmt = (d: string) => d ? d.replace(/-/g, '_') : 'any';
        filename = `bookings_${fmt(fromDate || '')}_to_${fmt(toDate || '')}.xlsx`;
      } else if (bookingsToExport.length === this._bookings().length) {
        filename = 'all_property_bookings.xlsx';
      } else {
        filename = `${bookingsToExport[0]?.propertyName.toLowerCase().replace(/['\s]/g, '_')}_bookings.xlsx`;
      }

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}
