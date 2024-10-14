import { CopyButtonComponent } from "./copy-button.component";
import { byTestId, createComponentFactory, Spectator } from "@ngneat/spectator";
import { TooltipComponent } from "../tooltip/tooltip.component";
import { asyncTimeout } from "../../../../../test-helpers";

describe("CopyButtonComponent", () => {
  const createComponent = createComponentFactory({
    component: CopyButtonComponent,
    shallow: true,
  });
  let spectator: Spectator<CopyButtonComponent>;
  const sampleIconName = "icon_name";
  const sampleTextToCopy = "copy me!";
  const animationDuration = 2000;
  const sampleSuccessMessage = "everything ok!";
  const buttonNotFoundText = "Button HTML element not found.";
  let button: HTMLButtonElement | null;
  let clipboardSpy: jasmine.Spy;
  let tooltipComponent: TooltipComponent | null;

  beforeEach(async () => {
    spectator = createComponent({
      props: {
        icon: sampleIconName,
        text: sampleTextToCopy,
        successMessage: sampleSuccessMessage,
      },
    });
    button = spectator.query(byTestId("copy-button"));
    tooltipComponent = spectator.query(TooltipComponent);
    clipboardSpy = spyOn(navigator.clipboard, "writeText");
  });

  it("shows input icon", () => {
    expect(spectator.query(byTestId("copy-button-icon"))).toHaveText(
      sampleIconName
    );
  });

  it("can show circular button", () => {
    spectator.setInput({ circularButton: true });
    expect(button).toHaveClass("btn-circle");
  });

  it("copies text to clipboard", () => {
    if (!button) {
      throw buttonNotFoundText;
    }
    spectator.click(button);
    expect(clipboardSpy).toHaveBeenCalledWith(sampleTextToCopy);
  });

  it("initially hides tooltip", () => {
    expect(tooltipComponent?.disabled).toBe(true);
  });

  it("shows tooltip on click, then hides it", async () => {
    if (!button) {
      throw buttonNotFoundText;
    }
    spectator.click(button);
    expect(tooltipComponent?.disabled).toBe(false);
    await asyncTimeout(animationDuration);
    expect(tooltipComponent?.disabled).toBe(true);
  });

  it("shows correct success message", () => {
    expect(tooltipComponent?.label).toBe(sampleSuccessMessage);
  });
});
