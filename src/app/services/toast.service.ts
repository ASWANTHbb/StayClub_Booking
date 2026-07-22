import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  private toastCount = 0;

  success(message: string, duration = 3000) {
    this.addToast(message, 'success', duration);
  }

  error(message: string, duration = 4000) {
    this.addToast(message, 'error', duration);
  }

  info(message: string, duration = 3000) {
    this.addToast(message, 'info', duration);
  }

  warning(message: string, duration = 3000) {
    this.addToast(message, 'warning', duration);
  }

  private addToast(message: string, type: Toast['type'], duration: number) {
    const id = `toast-${++this.toastCount}`;
    const toast: Toast = { id, message, type, duration };

    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.removeToast(id), duration);
    }
  }

  removeToast(id: string) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
