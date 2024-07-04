import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  Type,
  createComponent,
} from "@angular/core";
import { ModalComponent } from "./modal/modal.component";
import {
  ConfirmModalContentComponent,
  ConfirmModalProps,
} from "./confirm-modal/confirm-modal-content.component";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  modalComponent!: ComponentRef<ModalComponent>;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  openConfirmModal(props: ConfirmModalProps) {
    this.openModal(ConfirmModalContentComponent, props);

    document.body.appendChild(this.modalComponent.location.nativeElement);
    // Attach views to the changeDetection cycle
    this.appRef.attachView(this.modalComponent.hostView);
  }

  openModal = (component: Type<unknown>, inputProps: any = {}) => {
    // create the desired component, the content of the modal box
    const newComponent = createComponent(component, {
      environmentInjector: this.injector,
    });

    for (const [key, value] of Object.entries(inputProps)) {
      newComponent.setInput(key, value);
    }

    // create the modal component and project the instance of the desired component in the ng-content
    this.modalComponent = createComponent(ModalComponent, {
      environmentInjector: this.injector,
      projectableNodes: [[newComponent.location.nativeElement]],
    });

    document.body.appendChild(this.modalComponent.location.nativeElement);

    // Attach views to the changeDetection cycle
    this.appRef.attachView(newComponent.hostView);
    this.appRef.attachView(this.modalComponent.hostView);
  };

  close() {
    this.modalComponent.instance.close();
  }
}
