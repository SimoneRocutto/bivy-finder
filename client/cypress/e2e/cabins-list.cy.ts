const { _ } = Cypress;

describe("Cabins list", () => {
  const getTableRows = () => cy.byTestId("table-row");
  const getFirstTableRow = () => getTableRows().first();
  const search = (text: string, clear = true) => {
    const input = cy.byTestId("table-search-input");
    if (clear) {
      const clear = input.clear();
      if (text === "") {
        // We need to return: `type` method doesn't support empty strings
        return clear;
      }
    }
    return input.type(text);
  };
  const clickSortButton = (label: string) =>
    cy.byTestId("sort-button").contains(label).click();
  const expectTableSortedBy = (prop: string, desc = false) =>
    cy
      .get(`[data-tablecellprop='${prop}']`)
      .then((cells) => _.map(cells, "textContent"))
      .then((cellValues) => {
        // Case-insensitive sorting
        const sorted = _.orderBy(
          cellValues,
          [(value: string) => value.toLowerCase()],
          desc ? ["desc"] : []
        );
        expect(cellValues, "cells are sorted").to.deep.equal(sorted);
      });

  beforeEach(() => {
    cy.intercept("/api/auth/check-login").as("checkLogin");
    cy.intercept("/api/cabins").as("getCabins");
    cy.visit("/cabins-list");
    cy.wait("@checkLogin");
    cy.wait("@getCabins");
  });

  it("Shows cabins table", () => {
    cy.get("app-table").should("be.visible");
  });

  it("Shows cabin table sorted by name (case insensitive)", () => {
    expectTableSortedBy("name");
  });

  // ! We should not assume 2nd page has different first row content!
  // In the future, we could setup tests so that a dedicated DB is used.
  // This way, we could expect a certain value for the first row of page 2.
  it("Changes pagination page", () => {
    getFirstTableRow().then(($tr) => {
      // Next button test
      cy.byTestId("next-button").first().click();
      getFirstTableRow()
        .should("not.have.text", $tr.text())
        .then(($tr2) => {
          // Prev button test
          cy.byTestId("prev-button").first().click();
          getFirstTableRow().should("have.text", $tr.text());
          // Number buttons test
          cy.byTestId("pagination-number-button-2").first().click();
          getFirstTableRow().should("have.text", $tr2.text());
          cy.byTestId("pagination-number-button-1").first().click();
          getFirstTableRow().should("have.text", $tr.text());
        });
    });
  });

  it("Filters table", () => {
    getFirstTableRow()
      .should("exist")
      .then(($tr) => {
        // ! Assuming at least one record passes this filter: change this
        // when using a dedicated DB with known fake data.
        search("a", false);
        getFirstTableRow().should("exist");
        search("This text will never exist anywhere, never ever!!!");
        getTableRows().should("not.exist");
        search("");
        getFirstTableRow().should("have.text", $tr.text());
      });
  });

  it("Sorts table", () => {
    clickSortButton("Type");
    expectTableSortedBy("type");
    clickSortButton("Type");
    expectTableSortedBy("type", true);
    clickSortButton("Material");
    expectTableSortedBy("material");
    clickSortButton("Material");
    expectTableSortedBy("material", true);
  });

  it("Goes to cabin detail", () => {
    getFirstTableRow()
      .find("[data-tablecellprop='name']")
      .then(($tc) => {
        cy.byTestId("cabins-list-map-button").first().click();
        cy.expectUrl("/cabins-map/*");
        cy.byTestId("cabin-detail-name").should("have.text", $tc.text());
      });
  });
});
