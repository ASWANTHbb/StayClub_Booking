export interface Booking {
  id: string;
  customerName: string;
  propertyName: string;
  adults: number;
  children: number;
  checkInDate: string;  // Format: YYYY-MM-DD
  checkOutDate: string; // Format: YYYY-MM-DD
  totalPayment: number;
  advanceAmount: number;
  balancePayment: number; // totalPayment - advanceAmount
  checkInTime?: string;   // e.g., "14:00" (needed for Today's Bookings cards)
}

export interface PropertyStats {
  propertyName: string;
  todaysBookingsCount: number;
  totalBookingsCount: number;
  pendingPaymentsCount: number;
  completedPaymentsCount: number;
}

export interface Expense {
  id: string;
  propertyName: string;
  amount: number;
  description: string;
  date: string;
}
