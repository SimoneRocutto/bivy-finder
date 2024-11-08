import { Injectable } from "@angular/core";
import { Toast, ToastType } from "./toast.type";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  toasts: Toast[] = [];

  constructor() {}

  createToast(message: string, type: ToastType, duration: number = 3000) {
    const toast = { message, type };
    this.toasts.push(toast);
    setTimeout(() => {
      this.dismissToast(toast);
    }, duration);
    return toast;
  }

  dismissToast(toast: Toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
