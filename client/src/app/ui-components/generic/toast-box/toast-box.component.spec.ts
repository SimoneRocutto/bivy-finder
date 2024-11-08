import {
  byTestId,
  createComponentFactory,
  Spectator,
  SpyObject,
} from "@ngneat/spectator";
import { ToastBoxComponent } from "./toast-box.component";
import { ToastService } from "./toast.service";
import { Toast } from "./toast.type";
import { asyncTimeout } from "../../../../../test-helpers";

describe("ToastBoxComponent integration test", () => {
  const createComponent = createComponentFactory({
    component: ToastBoxComponent,
    shallow: false,
    providers: [ToastService],
  });
  let spectator: Spectator<ToastBoxComponent>;
  let service: SpyObject<ToastService>;

  const getToasts = () =>
    spectator.queryAll(byTestId("toast")) as HTMLDivElement[];

  const toastMatches = (renderedToast: HTMLDivElement, toast: Toast) => {
    const toastClass = toastClasses[toast.type];
    const span = renderedToast.querySelector(
      "[data-testid='toast-message']"
    ) as HTMLSpanElement;
    return (
      span?.innerText === toast.message &&
      renderedToast.classList.contains(toastClass)
    );
  };
  const toastClasses = {
    info: "alert-info",
    success: "alert-success",
    error: "alert-error",
  };

  const expectToast = (toast: Toast, i?: number) => {
    const renderedToasts = getToasts();
    // Expect the i-th element to have desired properties.
    if (i !== undefined) {
      expect(toastMatches(renderedToasts?.[i], toast)).toBeTrue();
    } else {
      // Expect at least one element to have desired properties.
      expect(
        renderedToasts.some((renderedToast) =>
          toastMatches(renderedToast, toast)
        )
      ).toBeTrue();
    }
  };

  const expectToastToBeAbsent = (toast: Toast) => {
    const renderedToasts = getToasts();
    expect(
      renderedToasts.some((renderedToast) => toastMatches(renderedToast, toast))
    ).toBeFalse();
  };

  beforeEach(async () => {
    spectator = createComponent({
      props: {},
    });
    service = spectator.inject(ToastService, true);
  });

  it("displays created toasts", () => {
    const toast1: Toast = { message: "This is an info", type: "info" };
    const toast2: Toast = { message: "This is an error", type: "error" };
    service.createToast(toast1.message, toast1.type);
    service.createToast(toast2.message, toast2.type);
    spectator.fixture.detectChanges();
    expectToast(toast1, 0);
    expectToast(toast2, 1);
  });

  it("dismisses a toast after timeout", async () => {
    const toast = service.createToast("Hello world!", "error", 1000);
    spectator.fixture.detectChanges();
    await asyncTimeout(990);
    expectToast(toast);
    // Waiting a bit more than 1 second on purpose (operation takes a bit more time
    // to finish).
    await asyncTimeout(200);
    spectator.fixture.detectChanges();
    expectToastToBeAbsent(toast);
  });

  it("dismisses toast when clicking dismiss button", () => {
    const toast = service.createToast("Sample text", "info", 1000);
    spectator.fixture.detectChanges();

    const closeButton = spectator
      .query(byTestId("close-toast-button"))
      ?.querySelector("button");
    if (!closeButton) {
      throw "No HTML close button found.";
    }

    expectToast(toast);

    spectator.click(closeButton);
    spectator.fixture.detectChanges();

    expectToastToBeAbsent(toast);
  });
});
