import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";

@Component({
  selector: "app-modal",
  standalone: true,
  imports: [CommonModule],
  template: `
    <dialog #modal class="modal w-screen h-screen sm:modal">
      <div
        class="modal-box w-full h-full max-w-none max-h-none rounded-none sm:modal-box sm:h-auto"
      >
        <ng-content></ng-content>
      </div>
    </dialog>
  `,
  styles: ``,
})
export class ModalComponent implements AfterViewInit {
  @ViewChild("modal") modal!: ElementRef<HTMLDialogElement>;

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
