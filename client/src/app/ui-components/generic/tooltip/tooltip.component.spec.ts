import { TooltipComponent } from "./tooltip.component";
import { getBefore } from "../../../../../test-helpers";
import { byTestId, createComponentFactory, Spectator } from "@ngneat/spectator";

// TODO Test hover events for opening and closing (I couldn't get it to work).
// The difficult part is testing before pseudoelement style, which we can only
// access with window.getComputedStyle.
describe("TooltipComponent", () => {
  const createComponent = createComponentFactory({
    component: TooltipComponent,
    shallow: true,
  });
  let spectator: Spectator<TooltipComponent>;
  const sampleLabel = "label test";
  const noLabelDivText = "No label div found.";
  let labelDiv: HTMLDivElement | null;

  beforeEach(async () => {
    spectator = createComponent({
      props: {
        label: sampleLabel,
      },
    });
    labelDiv = spectator.query(byTestId("tooltip"));
  });

  it("renders the tooltip with the label", () => {
    if (!labelDiv) {
      throw noLabelDivText;
    }
    const style = getBefore(labelDiv);
    expect(style.content.slice(1, -1)).toBe(sampleLabel);
  });

  it("can be forced open", () => {
    if (!labelDiv) {
      throw noLabelDivText;
    }
    spectator.setInput({ forceOpen: true });
    const opacity = getBefore(labelDiv).opacity;
    expect(opacity).toBe("1");
  });

  it("can be disabled", () => {
    if (!labelDiv) {
      throw noLabelDivText;
    }
    spectator.setInput({ disabled: true });
    const opacity = getBefore(labelDiv).opacity;
    expect(opacity).toBe("0");
  });
});
