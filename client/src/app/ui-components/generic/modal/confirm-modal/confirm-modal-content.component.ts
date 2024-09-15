import { ToastService } from "./../../toast-box/toast.service";
import { Component, Input } from "@angular/core";
import { Observable, catchError, of, tap } from "rxjs";
import { ModalService } from "../modal.service";
import { CommonModule } from "@angular/common";

export interface ConfirmModalProps {
  title: string;
  content?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onConfirmObs?: () => Observable<any>;
}
@Component({
  selector: "app-confirm-modal",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      style="max-height: calc(100vh - 5em - 3rem); max-height: calc(100dvh - 5em - 3em)"
      class="flex flex-col"
    >
      <h3 class="text-lg font-bold">{{ title }}</h3>
      <!-- White space: pre makes it so that we can add line breaks in the content with \\n
       (only one slash) -->
      <p class="py-4 whitespace-pre overflow-auto">{{ content }}</p>
      <div class="modal-action">
        <form (submit)="onSubmit($event)">
          <!-- if there is a button in form, it will close the modal -->
          <div class="flex gap-4">
            <button
              type="button"
              [disabled]="isSubmitting"
              class="btn btn-error"
              (click)="onCancel()"
            >
              {{ cancelLabel }}
            </button>
            <button
              type="submit"
              [disabled]="isSubmitting"
              class="btn btn-primary relative"
            >
              <div [ngClass]="{ invisible: isSubmitting }">
                {{ confirmLabel }}
              </div>
              <span
                *ngIf="isSubmitting"
                class="loading loading-dots loading-md absolute"
              ></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: ``,
})
export class ConfirmModalContentComponent {
  @Input() title: string = "Default title";
  @Input() content?: string;
  @Input() confirmLabel?: string = "Confirm";
  @Input() cancelLabel?: string = "Cancel";
  @Input() onConfirm?: () => void;
  @Input() onConfirmObs?: () => Observable<any>;

  isSubmitting = false;

  constructor(
    private modalService: ModalService,
    private toastService: ToastService
  ) {}

  onSubmit = (e: Event) => {
    e.preventDefault();
    if (this.onConfirm) {
      this.onConfirm();
      this.modalService.close();
      return;
    }
    if (this.onConfirmObs) {
      this.isSubmitting = true;
      this.onConfirmObs()
        .pipe(
          tap(() => {
            this.modalService.close();
          }),
          catchError((err) => {
            this.isSubmitting = false;
            this.toastService.createToast("Unknown error", "error");
            return of(err);
          })
        )
        .subscribe();
    }
  };

  onCancel = () => {
    this.modalService.close();
  };
}
