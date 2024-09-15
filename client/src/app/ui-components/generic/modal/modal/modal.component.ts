import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from "@angular/core";

@Component({
  selector: "app-modal",
  standalone: true,
  imports: [CommonModule],
  template: `
    <dialog
      #modal
      class="modal"
      [ngClass]="{ 'w-screen h-screen h-dvh sm:modal': fullOnSmallScreen }"
    >
      <div
        class="modal-box"
        [ngClass]="{
          'w-full h-full max-w-none max-h-none rounded-none sm:modal-box sm:h-auto':
            fullOnSmallScreen
        }"
      >
        <ng-content></ng-content>
      </div>
    </dialog>
  `,
  styles: ``,
})
export class ModalComponent implements AfterViewInit {
  @ViewChild("modal") modal!: ElementRef<HTMLDialogElement>;
  @Input() fullOnSmallScreen = false;

  ngAfterViewInit() {
    this.showModal();
  }

  close = () => {
    this.modal.nativeElement.close();
  };
  showModal = () => {
    this.modal.nativeElement.showModal();
  };
}
