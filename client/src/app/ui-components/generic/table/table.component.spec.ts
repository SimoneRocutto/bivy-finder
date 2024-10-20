import { byTestId, createComponentFactory, Spectator } from "@ngneat/spectator";
import { TableComponent } from "./table.component";
import { PaginationComponent } from "../pagination/pagination.component";
import { TableColumn } from "./table.type";

fdescribe("TableComponent", () => {
  const createComponent = createComponentFactory({
    component: TableComponent,
    shallow: true,
  });
  let spectator: Spectator<TableComponent<any>>;

  const textTranformClasses = {
    uppercase: "uppercase",
    lowercase: "lowercase",
    capitalize: "first-letter:uppercase",
  };

  const renderTest = (columns: TableColumn<any>[], items: any[]) => {
    spectator.setInput({
      columns,
      items,
    });
    const filteredColumns = columns.filter((column) => !column.hidden);
    const table = spectator.query("table");
    if (!table) {
      throw "Table element not found.";
    }
    const head = table.querySelector("thead");
    const tableHeaderCells = head?.querySelectorAll("th");
    expect(tableHeaderCells?.length).toBe(filteredColumns.length);

    const body = table.querySelector("tbody");
    const tableBodyRows = body?.querySelectorAll("tr");
    expect(tableBodyRows?.length).toBe(items.length);

    tableBodyRows?.forEach((row, i) => {
      const tableBodyCells = row.querySelectorAll("td");
      expect(tableBodyCells.length).toBe(filteredColumns.length);
      // Every cell should have the expected text
      tableBodyCells?.forEach((cell, j) => {
        // TODO Remove as string and correct prop typing
        const column = filteredColumns[j];
        const prop = column.prop as string;
        const baseText = items[i][prop] + "";
        const text = column.transform ? column.transform(baseText) : baseText;
        expect(cell).toHaveText(text);

        const textTransform = column.style?.textTransform;
        if (textTransform) {
          expect(cell).toHaveClass(textTranformClasses[textTransform]);
        }
      });
    });
  };

  beforeEach(async () => {
    spectator = createComponent({
      props: {},
    });
  });

  it("renders a table correctly - basic table", () => {
    const columns: TableColumn<{ username: string; age: number }>[] = [
      {
        prop: "username",
        name: "Username",
      },
      { prop: "age", name: "Age" },
    ];
    const items = [
      { username: "JotaroKujo", age: 17 },
      { username: "DioBrando", age: 120 },
      { username: "JosephJoestar", age: 69 },
    ];
    renderTest(columns, items);
  });

  it("renders a table correctly - transform", () => {
    const columns: TableColumn<{ username: string; age: number }>[] = [
      {
        prop: "username",
        name: "Username",
        transform: (text) => "xX" + text + "Xx",
      },
      { prop: "age", name: "Age" },
    ];
    const items = [
      { username: "JotaroKujo", age: 17 },
      { username: "DioBrando", age: 120 },
      { username: "JosephJoestar", age: 69 },
    ];
    renderTest(columns, items);
  });

  it("renders a table correctly - hidden column", () => {
    const columns: TableColumn<{ username: string; age: number }>[] = [
      {
        prop: "username",
        name: "Username",
        hidden: true,
      },
      { prop: "age", name: "Age" },
    ];
    const items = [
      { username: "JotaroKujo", age: 17 },
      { username: "DioBrando", age: 120 },
      { username: "JosephJoestar", age: 69 },
    ];
    renderTest(columns, items);
  });

  it("renders a table correctly - style column", () => {
    interface FakeItems {
      username: string;
      firstName: string;
      lastName: string;
      age: number;
    }
    const columns: TableColumn<FakeItems>[] = [
      {
        prop: "username",
        name: "Username",
        style: { textTransform: "uppercase" },
      },
      {
        prop: "firstName",
        name: "First name",
        style: { textTransform: "lowercase" },
      },
      {
        prop: "lastName",
        name: "Last name",
        style: { textTransform: "capitalize" },
      },
      { prop: "age", name: "Age" },
    ];
    const items: FakeItems[] = [
      {
        username: "JotaroKujo",
        firstName: "Jotaro",
        lastName: "kujo",
        age: 17,
      },
      { username: "DioBrando", firstName: "Dio", lastName: "brando", age: 120 },
      {
        username: "JosephJoestar",
        firstName: "Joseph",
        lastName: "joestar",
        age: 69,
      },
    ];
    renderTest(columns, items);
  });

  it("sorts data correctly", () => {
    interface FakeItems {
      username: string;
      firstName: string;
      lastName: string;
      age: number;
    }
    const items: FakeItems[] = [
      {
        username: "JotaroKujo",
        firstName: "Jotaro",
        lastName: "kujo",
        age: 17,
      },
      { username: "DioBrando", firstName: "Dio", lastName: "brando", age: 120 },
      {
        username: "JosephJoestar",
        firstName: "Joseph",
        lastName: "joestar",
        age: 69,
      },
    ];
    const columns: TableColumn<FakeItems>[] = [
      {
        prop: "username",
        name: "Username",
      },
      {
        prop: "firstName",
        name: "First name",
      },
      {
        prop: "lastName",
        name: "Last Name",
      },
      { prop: "age", name: "Age" },
    ];
    spectator.setInput({ items, columns });
    const sortButtons: HTMLButtonElement[] = spectator.queryAll(
      byTestId("sort-button")
    );
    const usernameButton = sortButtons[0];
    // Sort by username (ascending)
    spectator.click(usernameButton);
    expect(spectator.component.filteredItems).toEqual([
      items[1],
      items[2],
      items[0],
    ]);
    // Sort by username (descending)
    spectator.click(usernameButton);
    expect(spectator.component.filteredItems).toEqual([
      items[0],
      items[2],
      items[1],
    ]);
  });

  it("shows skeleton table with correct number of rows when loading", () => {
    const pageSize = 20;
    spectator.setInput({ isLoading: true, pageSize });
    expect(spectator.queryAll(byTestId("table-row-skeleton")).length).toBe(
      pageSize
    );
  });

  it("renders at least one pagination component", () => {
    const paginations = spectator.queryAll(PaginationComponent);
    expect(paginations.length).toBeGreaterThan(0);
  });

  it("passes correct input to pagination", () => {
    const props = {
      pageSize: 42,
      isLoading: true,
      pageNumber: 2,
      extraPageButtons: 3,
    };

    // Set component props
    for (const [key, value] of Object.entries(props)) {
      spectator.component[key] = value;
    }
    spectator.fixture.detectChanges();

    const paginations = spectator.queryAll(PaginationComponent);
    for (const pagination of paginations) {
      for (const [key, value] of Object.entries(props)) {
        expect(pagination[key]).toBe(value);
      }
    }
  });

  it("reacts to pagination number change event", () => {
    spectator.component.pageNumber = 1;
    const pagination = spectator.query(PaginationComponent);
    const newPageNumber = 2;
    pagination?.pageNumberChange.emit(newPageNumber);
    expect(spectator.component.pageNumber).toBe(newPageNumber);
  });

  it("reacts to pagination shown items change event", () => {
    const firstPage = [
      { firstName: "Jotaro", lastName: "Kujo" },
      { firstName: "Dio", lastName: "Brando" },
    ];
    const nextPage = [
      { firstName: "Joseph", lastName: "Joestar" },
      { firstName: "Jonathan", lastName: "Joestar" },
    ];
    spectator.component.shownItems = firstPage;
    const pagination = spectator.query(PaginationComponent);
    pagination?.shownItemsChange.emit(nextPage);
    expect(spectator.component.shownItems).toEqual(nextPage);
  });
});
