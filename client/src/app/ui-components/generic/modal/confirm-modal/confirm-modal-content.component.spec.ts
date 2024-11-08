import {
  byTestId,
  createComponentFactory,
  createSpyObject,
  Spectator,
  SpyObject,
} from "@ngneat/spectator";
import { ConfirmModalContentComponent } from "./confirm-modal-content.component";
import { ModalService } from "../modal.service";
import { of } from "rxjs";
import { ToastService } from "../../toast-box/toast.service";

describe("ConfirmModalContentComponent", () => {
  const createComponent = createComponentFactory({
    component: ConfirmModalContentComponent,
    shallow: true,
    mocks: [ToastService],
  });
  let spectator: Spectator<ConfirmModalContentComponent>;
  let modalService: SpyObject<ModalService>;

  beforeEach(async () => {
    modalService = createSpyObject(ModalService);
    spectator = createComponent({
      providers: [
        {
          provide: ModalService,
          useValue: modalService,
        },
      ],
    });
  });

  it("triggers onConfirm when clicking confirm button", () => {
    const props = {
      title: "Are you really sure?",
      content: "This is the content",
      confirmLabel: "Confirm button!",
      cancelLabel: "Cancel button!",
      onConfirm: () => {
        console.log("hello!");
      },
    };
    const spy = spyOn(props, "onConfirm");
    spectator.setInput(props);
    const confirmButton = spectator.query(byTestId("confirm-button"));
    if (!confirmButton) {
      throw "No confirm button found";
    }

    spectator.click(confirmButton);
    expect(spy).toHaveBeenCalled();
  });

  it("triggers onConfirmObs when clicking confirm button", () => {
    const props = {
      title: "Are you really sure?",
      content: "This is the content",
      confirmLabel: "Confirm button!",
      cancelLabel: "Cancel button!",
      onConfirmObs: () => of([1, 2, 3]),
    };
    const spy = spyOn(props, "onConfirmObs").and.returnValue(of([1, 2, 3]));
    spectator.setInput(props);
    const confirmButton = spectator.query(byTestId("confirm-button"));
    if (!confirmButton) {
      throw "No confirm button found";
    }

    spectator.click(confirmButton);
    expect(spy).toHaveBeenCalled();
  });

  it("calls modalService.close when clicking cancel button", () => {
    const props = {
      title: "Are you really sure?",
      content: "This is the content",
      confirmLabel: "Confirm button!",
      cancelLabel: "Cancel button!",
      onConfirm: () => {
        console.log("hello!");
      },
    };
    spectator.setInput(props);
    const cancelButton = spectator.query(byTestId("cancel-button"));
    if (!cancelButton) {
      throw "No cancel button found";
    }

    spectator.click(cancelButton);
    expect(modalService.close).toHaveBeenCalled();
  });

  it("calls modalService.close when clicking confirm button (onConfirm input)", () => {
    const props = {
      title: "Are you really sure?",
      content: "This is the content",
      confirmLabel: "Confirm button!",
      cancelLabel: "Cancel button!",
      onConfirm: () => {
        console.log("hello!");
      },
    };
    spectator.setInput(props);
    const confirmButton = spectator.query(byTestId("confirm-button"));
    if (!confirmButton) {
      throw "No confirm button found";
    }

    spectator.click(confirmButton);
    expect(modalService.close).toHaveBeenCalled();
  });

  it("calls modalService.close when clicking confirm button (onConfirmObs input)", () => {
    const props = {
      title: "Are you really sure?",
      content: "This is the content",
      confirmLabel: "Confirm button!",
      cancelLabel: "Cancel button!",
      onConfirmObs: () => of([1, 2, 3]),
    };
    spectator.setInput(props);
    const confirmButton = spectator.query(byTestId("confirm-button"));
    if (!confirmButton) {
      throw "No confirm button found";
    }

    spectator.click(confirmButton);
    expect(modalService.close).toHaveBeenCalled();
  });
});
