import { createServiceFactory, SpectatorService } from "@ngneat/spectator";
import { ToastService } from "./toast.service";
import { Toast } from "./toast.type";
import { asyncTimeout } from "../../../../../test-helpers";

describe("ToastService", () => {
  const createService = createServiceFactory({
    service: ToastService,
  });
  let spectator: SpectatorService<ToastService>;
  let service: ToastService;
  const expectToast = (toast: Toast) => {
    expect(spectator.service.toasts).toContain(toast);
  };
  const expectToastToBeAbsent = (toast: Toast) => {
    expect(spectator.service.toasts).not.toContain(toast);
  };

  beforeEach(async () => {
    spectator = createService({});
    service = spectator.service;
  });

  it("creates a toast", () => {
    const toast = service.createToast("Test toast", "info");
    expectToast(toast);
  });

  it("dismisses a toast after timeout", async () => {
    const toast = service.createToast("Hello world!", "error", 1000);
    await asyncTimeout(990);
    expectToast(toast);
    // Waiting a bit more than 1 second on purpose (operation takes a bit more time
    // to finish).
    await asyncTimeout(200);
    expectToastToBeAbsent(toast);
  });

  it("dismisses a toast", () => {
    const toast = service.createToast("Foo", "success");
    expectToast(toast);
    service.dismissToast(toast);
    expectToastToBeAbsent(toast);
  });
});
