import { byTestId, createComponentFactory, Spectator } from "@ngneat/spectator";
import { PaginationNumberButtonComponent } from "./pagination-number-button.component";
import { PaginationButtonComponent } from "../pagination-button/pagination-button.component";

describe("PaginationNumberButtonComponent", () => {
  const createComponent = createComponentFactory({
    component: PaginationNumberButtonComponent,
    shallow: true,
  });
  let spectator: Spectator<PaginationNumberButtonComponent>;
  let button: HTMLButtonElement | null;
  let paginationButton: PaginationButtonComponent | null;

  beforeEach(async () => {
    spectator = createComponent({
      props: {},
    });
    button = spectator.query(byTestId("pagination-button"));
    paginationButton = spectator.query(PaginationButtonComponent);
  });

  it("passes page number as ng-content", () => {
    const sampleNumber = 42;
    spectator.setInput({ buttonPageNumber: sampleNumber });
    expect(spectator.element).toHaveText(sampleNumber + "");
  });

  it("is not active (highlighted) when current page is not the button page number", () => {
    spectator.setInput({ buttonPageNumber: 42, currentPageNumber: 420 });
    const paginationButton = spectator.query(PaginationButtonComponent);
    expect(paginationButton?.active).toBeFalse();
  });

  it("is active (highlighted) when current page is the button page number", () => {
    const sampleNumber = 42;
    spectator.setInput({
      buttonPageNumber: sampleNumber,
      currentPageNumber: sampleNumber,
    });
    expect(paginationButton?.active).toBeTrue();
  });

  it("emits onClick event when app-pagination-button emits onClick event", () => {
    if (!paginationButton) {
      throw "Pagination button component not found in the template.";
    }
    let hasFired = false;
    spectator.component.onClick.subscribe(() => {
      hasFired = true;
    });
    paginationButton.onClick.emit();
    expect(hasFired).toBeTrue();
  });
});
