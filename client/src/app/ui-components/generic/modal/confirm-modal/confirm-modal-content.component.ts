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
    <div style="max-height: calc(100vh - 5em - 3rem)" class="flex flex-col">
      <h3 class="text-lg font-bold">{{ title }}</h3>
      <!-- White space: pre makes it so that we can add line breaks in the content with \\n
       (only one slash) -->
      <p class="py-4 whitespace-pre overflow-auto">{{ content }}</p>
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
