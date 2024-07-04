export type ToastType = "info" | "success" | "error";
export interface Toast {
  message: string;
  type: ToastType;
}
