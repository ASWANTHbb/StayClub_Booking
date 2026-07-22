import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense } from '../models/booking.model';
import * as ExcelJS from 'exceljs';

const API_URL = 'http://localhost:3000/api/expenses';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly http = inject(HttpClient);

  // Get all expenses for a specific property
  getExpensesByProperty(propertyName: string): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${API_URL}/property/${encodeURIComponent(propertyName)}`);
  }

  // Create a new expense
  addExpense(expenseData: Omit<Expense, 'id'>): Observable<Expense> {
    return this.http.post<Expense>(API_URL, expenseData);
  }

  // Update an existing expense
  updateExpense(id: string, expenseData: Omit<Expense, 'id'>): Observable<Expense> {
    return this.http.put<Expense>(`${API_URL}/${id}`, expenseData);
  }

  // Delete an expense
  deleteExpense(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }

  // Export expenses to Excel
  exportToExcel(expensesToExport: Expense[], propertyName: string, fromDate?: string, toDate?: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expenses Report');

    // Force grid lines visibility
    worksheet.views = [{ showGridLines: true }];

    // 1. Add Title Block (styled)
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'D2V EXPENSES REPORT';
    titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'DC2626' } // Red for expenses
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 40;

    // 2. Add Meta info
    worksheet.mergeCells('A2:D2');
    const metaCell = worksheet.getCell('A2');
    const dateRangeStr = (fromDate && toDate) ? `Period: ${fromDate} to ${toDate}` : 'Period: All Expenses';
    metaCell.value = `Property: ${propertyName}   |   ${dateRangeStr}   |   Exported: ${new Date().toLocaleDateString()}`;
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
    const headers = ['Date', 'Description', 'Amount', 'Notes'];
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 26;

    // Style headers
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'B91C1C' } // Dark red
      };
      cell.alignment = { vertical: 'middle', horizontal: cell.address.startsWith('C') ? 'right' : 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: '94A3B8' } },
        left: { style: 'thin', color: { argb: '94A3B8' } },
        bottom: { style: 'medium', color: { argb: '1E293B' } },
        right: { style: 'thin', color: { argb: '94A3B8' } }
      };
    });

    // 4. Add data rows
    let totalExpense = 0;
    expensesToExport.forEach((e) => {
      const dataRow = worksheet.addRow([
        e.date,
        e.description,
        e.amount,
        ''
      ]);
      dataRow.height = 22;
      totalExpense += e.amount;

      dataRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: '0F172A' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        };

        if (colNumber === 3) {
          cell.numFmt = '"₹"#,##0.00';
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
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
      'Total Expenses:',
      expensesToExport.length,
      totalExpense,
      ''
    ]);
    summaryRow.height = 24;

    summaryRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '1E293B' } };
      if (colNumber === 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else if (colNumber === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if (colNumber === 3) {
        cell.numFmt = '"₹"#,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'B91C1C' } };
      }
    });

    // 6. Set custom column widths
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
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      let filename: string;
      if (fromDate || toDate) {
        const fmt = (d: string) => d ? d.replace(/-/g, '_') : 'any';
        filename = `expenses_${fmt(fromDate || '')}_to_${fmt(toDate || '')}.xlsx`;
      } else {
        filename = `${propertyName.toLowerCase().replace(/['\s]/g, '_')}_expenses.xlsx`;
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
