import { createServiceFactory, SpectatorService } from "@ngneat/spectator";
import { ModalService } from "./modal.service";
import { Component, ComponentRef } from "@angular/core";
import { asyncTimeout } from "../../../../../test-helpers";
import { of } from "rxjs";
import { ModalComponent } from "./modal/modal.component";

@Component({
  template: `<div data-testid="fake-modal-component">Fake component</div>`,
})
class FakeComponent {}

describe("ModalService", () => {
  const createService = createServiceFactory({
    service: ModalService,
  });
  let spectator: SpectatorService<ModalService>;
  let service: ModalService;
  let modalRef: ComponentRef<ModalComponent>;

  const getModalContent = () =>
    document
      .querySelector("[data-testid='modal']")
      ?.querySelector("[data-testid='fake-modal-component']");

  const getConfirmModal = () =>
    document.querySelector("[data-testid='confirm-modal']");

  beforeEach(async () => {
    spectator = createService({});
    service = spectator.service;
  });

  afterEach(() => {
    modalRef?.destroy();
  });

  it("creates a modal", () => {
    modalRef = service.openModal(FakeComponent).modal;
    const modalContent = getModalContent();
    expect(modalContent).toBeTruthy();
  });

  it("passes correct inputs to confirm modal", () => {
    const props = {
      title: "Are you really sure?",
      content: "This is the content",
      confirmLabel: "Confirm button!",
      cancelLabel: "Cancel button!",
      onConfirm: () => {
        console.log("hello!");
      },
      onConfirmObs: () => of([1, 2, 3]),
    };
    const modal = service.openConfirmModal(props);
    modalRef = modal.modal;
    const {
      title,
      content,
      confirmLabel,
      cancelLabel,
      onConfirm,
      onConfirmObs,
    } = modal.content.instance;
    expect({
      title,
      content,
      confirmLabel,
      cancelLabel,
      onConfirm,
      onConfirmObs,
    }).toEqual(props);
  });

  it("creates a confirm modal", () => {
    const title = "You sure m9?";
    const modal = service.openConfirmModal({ title });
    modalRef = modal.modal;
    expect(getConfirmModal()).toBeTruthy();
  });

  it("dismisses a modal", async () => {
    modalRef = service.openModal(FakeComponent).modal;
    expect(getModalContent()).toBeTruthy();
    // TODO: Understand what to use instead of a timeout
    await asyncTimeout(100);
    service.close();
    // Must be more than 200 - Modal component gets officially destroyed after
    // 200 ms so that animation can finish.
    await asyncTimeout(250);
    expect(getModalContent()).toBeFalsy();
  });
});
