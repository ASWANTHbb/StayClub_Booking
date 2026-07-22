import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts()" [class]="'toast toast-' + toast.type">
        <div class="toast-content">
          <svg *ngIf="toast.type === 'success'" class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg *ngIf="toast.type === 'error'" class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg *ngIf="toast.type === 'info'" class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <svg *ngIf="toast.type === 'warning'" class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button class="toast-close" (click)="toastService.removeToast(toast.id)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
    }

    .toast-success {
      background-color: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34D399;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15);
    }

    .toast-error {
      background-color: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #F87171;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15);
    }

    .toast-info {
      background-color: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: #A78BFA;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15);
    }

    .toast-warning {
      background-color: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #FBBF24;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15);
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .toast-icon {
      width: 20px;
      height: 20px;
      stroke-width: 2;
      flex-shrink: 0;
    }

    .toast-message {
      font-size: 0.95rem;
      font-weight: 500;
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
      margin-left: 0.75rem;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (max-width: 600px) {
      .toast-container {
        left: 10px;
        right: 10px;
        top: 10px;
      }

      .toast {
        max-width: 100%;
      }
    }
  `]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
