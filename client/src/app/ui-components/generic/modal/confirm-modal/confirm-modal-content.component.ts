import { Component, Input } from "@angular/core";

export interface ConfirmModalProps {
  title: string;
  content?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}
@Component({
  selector: "app-confirm-modal",
  standalone: true,
  imports: [],
  template: `
    <h3 class="text-lg font-bold">{{ title }}</h3>
    <p class="py-4">{{ content }}</p>
    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <div class="flex gap-4">
          <button class="btn btn-success" (click)="onConfirm()">
            {{ confirmLabel }}
          </button>
          <button class="btn btn-error">
            {{ cancelLabel }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: ``,
})
export class ConfirmModalContentComponent {
  @Input() title: string = "Default title";
  @Input() content?: string;
  @Input() confirmLabel?: string = "Confirm";
  @Input() cancelLabel?: string = "Cancel";
  @Input() onConfirm: () => void = () => {};
}
