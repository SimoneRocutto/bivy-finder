import { byTestId, createComponentFactory, Spectator } from "@ngneat/spectator";
import { PaginationButtonComponent } from "./pagination-button.component";

describe("PaginationButtonComponent", () => {
  const createComponent = createComponentFactory({
    component: PaginationButtonComponent,
    shallow: true,
  });
  let spectator: Spectator<PaginationButtonComponent>;
  let button: HTMLButtonElement | null;

  beforeEach(async () => {
    spectator = createComponent({
      props: {},
    });
    button = spectator.query(byTestId("pagination-button"));
  });

  it("can be active", () => {
    spectator.setInput({ active: true });
    expect(button).toHaveClass("btn-active");
  });

  it("can be disabled", () => {
    spectator.setInput({ disabled: true });
    expect(button).toHaveClass("btn-disabled");
  });

  it("emits onClick event on click", () => {
    if (!button) {
      throw "Button HTML element could not be found.";
    }
    let hasFired = false;
    spectator.component.onClick.subscribe(() => {
      hasFired = true;
    });
    spectator.click(button);
    expect(hasFired).toBeTrue();
  });
});
