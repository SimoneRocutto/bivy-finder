import { byTestId, createComponentFactory, Spectator } from "@ngneat/spectator";
import { PaginationComponent } from "./pagination.component";
import { PaginationNumberButtonComponent } from "./pagination-number-button/pagination-number-button.component";
import { PaginationButtonComponent } from "./pagination-button/pagination-button.component";
import { ElementRef } from "@angular/core";

describe("PaginationComponent", () => {
  const createComponent = createComponentFactory({
    component: PaginationComponent,
    shallow: true,
  });
  let spectator: Spectator<PaginationComponent>;

  /**
   * Gets all the pagination buttons.
   * @returns Pagination buttons array.
   */
  const getButtons = () => spectator.queryAll(PaginationNumberButtonComponent);
  const getArrowButtons = () => {
    const propButtons = spectator.queryAll(PaginationButtonComponent);
    const htmlElements = spectator.queryAll(PaginationButtonComponent, {
      read: ElementRef,
    });
    return propButtons.filter((item, i) =>
      ["prev-button", "next-button"].includes(
        htmlElements[i].nativeElement?.dataset?.testid ?? ""
      )
    );
  };

  beforeEach(async () => {
    spectator = createComponent({
      props: {},
    });
  });

  it("shows skeleton when loading", () => {
    spectator.setInput({ isLoading: true });
    expect(spectator.query(byTestId("pagination-skeleton"))).toBeTruthy();
  });

  it("shows the correct page", () => {
    let output: any[] = [];
    spectator.component.shownItemsChange.subscribe((result) => {
      output = result;
    });
    spectator.setInput({
      pageSize: 2,
      extraPageButtons: 2,
      pageNumber: 2,
      items: [
        { firstName: "Jotaro", lastName: "Kujo" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Joseph", lastName: "Joestar" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Last", lastName: "Page" },
      ],
    });
    expect(output).toEqual([
      { firstName: "Joseph", lastName: "Joestar" },
      { firstName: "Dio", lastName: "Brando" },
    ]);
  });

  it("changes page correctly when using prev and next buttons", () => {
    const startingPage = 2;
    spectator.setInput({
      pageSize: 2,
      extraPageButtons: 2,
      pageNumber: startingPage,
      items: [
        { firstName: "Jotaro", lastName: "Kujo" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Joseph", lastName: "Joestar" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Last", lastName: "Page" },
      ],
    });
    const [prevButton, nextButton] = getArrowButtons();
    // Go to next page
    prevButton.onClick.emit();
    expect(spectator.component.pageNumber).toBe(startingPage - 1);
    // Go back to previous page (startingPage)
    nextButton?.onClick?.emit();
    expect(spectator.component.pageNumber).toBe(startingPage);
  });

  //** OUTPUT TESTS **//

  it("fires onPageChange and pageNumberChange output events correctly", async () => {
    spectator.setInput({
      pageSize: 2,
      extraPageButtons: 2,
      items: [
        { firstName: "Jotaro", lastName: "Kujo" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Joseph", lastName: "Joestar" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Last", lastName: "Page" },
      ],
    });
    const buttons = getButtons();
    // Button with number 2
    const button = buttons[1];

    let pageNumberChangeOutput: number;
    spectator.component.pageNumberChange.subscribe((result) => {
      pageNumberChangeOutput = result;
    });

    let pageChangeOutput: any[] = [];
    spectator.component.shownItemsChange.subscribe((result) => {
      pageChangeOutput = result;
    });

    // Fire click event for button number 2. We cannot click on it,
    // since click handler is on <button> tag inside pagination-button.component
    button.onClick.emit(button.buttonPageNumber);

    //@ts-ignore - Output gets assigned in the subscribe block. The test works,
    // so no reason to throw errors here. Also, I'm using the same code we can
    // find in the Spectator docs so it should be nothing to worry about.
    expect(pageNumberChangeOutput).toEqual(2);

    expect(pageChangeOutput).toEqual([
      { firstName: "Joseph", lastName: "Joestar" },
      { firstName: "Dio", lastName: "Brando" },
    ]);
  });

  //** REGRESSION TESTS **//

  // Testing number of rendered buttons
  it("regression test 1", () => {
    spectator.setInput({
      pageSize: 2,
      extraPageButtons: 2,
      items: [
        { firstName: "Jotaro", lastName: "Kujo" },
        { firstName: "Dio", lastName: "Brando" },
      ],
    });
    const buttons = getButtons();
    expect(buttons.length).toBe(1);
  });

  it("regression test 2", () => {
    spectator.setInput({
      pageSize: 2,
      extraPageButtons: 2,
      pageNumber: 1,
      items: [
        { firstName: "Jotaro", lastName: "Kujo" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
      ],
    });
    // We are not considering < and > buttons
    const buttons = getButtons();
    expect(buttons.length).toBe(3);
  });

  it("regression test 3", () => {
    spectator.setInput({
      pageSize: 1,
      extraPageButtons: 2,
      pageNumber: 1,
      items: [
        { firstName: "Jotaro", lastName: "Kujo" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Jotaro", lastName: "Kujo" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
      ],
    });
    const buttons = getButtons();
    expect(buttons.length).toBe(6);
  });

  it("regression test 4", () => {
    spectator.setInput({
      pageSize: 1,
      extraPageButtons: 2,
      pageNumber: 5,
      items: [
        { firstName: "Jotaro", lastName: "Kujo" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Jotaro", lastName: "Kujo" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
        { firstName: "Dio", lastName: "Brando" },
      ],
    });
    const buttons = getButtons();
    expect(buttons.length).toBe(7);
  });
});
