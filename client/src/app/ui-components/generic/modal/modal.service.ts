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
import { Router } from "@angular/router";
import { Subscription, take } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  modalComponent!: ComponentRef<ModalComponent>;

  closeOnRouteChange?: Subscription;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
    private router: Router
  ) {}

  openConfirmModal(props: ConfirmModalProps) {
    this.openModal(ConfirmModalContentComponent, props);

    document.body.appendChild(this.modalComponent.location.nativeElement);
    // Attach views to the changeDetection cycle
    this.appRef.attachView(this.modalComponent.hostView);
  }

  openModal = <T>(component: Type<T>, inputProps: any = {}) => {
    // create the desired component, the content of the modal box
    const newComponent: ComponentRef<T> = createComponent(component, {
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

    this.closeOnRouteChange = this.router.events.pipe(take(1)).subscribe(() => {
      this.modalComponent.destroy();
    });
    return newComponent;
  };

  close() {
    this.modalComponent.instance.close();
    const component = this.modalComponent;
    this.closeOnRouteChange?.unsubscribe();
    // This completely clears the modal from the html. I'm setting a timeout to make
    // sure the closing transition is not too abrupt.
    setTimeout(() => {
      component.destroy();
    }, 200);
  }
}
