import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { IconButtonComponent } from "../icon-button/icon-button.component";
import { Toast } from "./toast.type";
import { ToastService } from "./toast.service";

@Component({
  selector: "app-toast-box",
  standalone: true,
  imports: [CommonModule, IconButtonComponent],
  template: `
    <div class="toast toast-end">
      <div
        *ngFor="let toast of toasts"
        class="alert flex flex-row justify-between items-center"
        [ngClass]="
          toast.type === 'error'
            ? 'alert-error'
            : toast.type === 'success'
            ? 'alert-success'
            : 'alert-info'
        "
      >
        <span>{{ toast.message }}</span>
        <app-icon-button
          (onClick)="dismissToast(toast)"
          iconName="close"
        ></app-icon-button>
      </div>
    </div>
  `,
  styles: ``,
})
export class ToastBoxComponent {
  get toasts(): Toast[] {
    return this.toastService.toasts;
  }

  constructor(private toastService: ToastService) {}

  dismissToast = (toast: Toast) => {
    this.toastService.dismissToast(toast);
  };
}
