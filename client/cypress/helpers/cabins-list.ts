import { adminLogin } from "./auth";
import { getRandomizedString } from "./main";
const { _ } = Cypress;

/**
 * Gets cabins table rows (must be on cabins list page to use this).
 * @returns Table rows Cypress chainable.
 */
export const getTableRows = () => cy.byTestId("table-row");

/**
 * Gets first cabins table row (must be on cabins list page to use this).
 * @returns Table row Cypress chainable.
 */
export const getFirstTableRow = () => getTableRows().first();

/**
 * Clicks the specified sort button (must be on cabins list page to use this).
 * @param label Sort button label
 * @returns Cypress chainable.
 */
export const clickSortButton = (label: string) =>
  cy.byTestId("sort-button").contains(label).click();

/**
 * Expects that cabins table is sorted by a specific prop (must be on cabins list page to use this).
 * @param prop Prop the table should be sorted by.
 * @param desc Whether expected sorting is descending or not.
 * @returns Cypress chainable.
 */
export const expectTableSortedBy = (prop: string, desc = false) =>
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

/**
 * Searches cabins table using search form (must be on cabins list page to use this).
 * @param text Text to search for.
 * @param clear Whether to clear input field before typing the text.
 * @returns Cypress chainable.
 */
export const search = (text: string, clear = true) => {
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

/**
 * Checks that a given form is filled as expected.
 * @param form Object with key-value pairs that describe a form: keys are form fields testids, values are form
 * fields values.
 * @param getParent Function that gets an HTML element. If provided, the form fields to check will be searched
 * for inside that element.
 */
export const checkForm = (
  form: { [key: string]: any },
  getParent?: () => Cypress.Chainable
) => {
  const inputTagNames = ["input", "textarea", "select", "checkbox"];
  for (const [key, value] of Object.entries(form)) {
    (getParent ? getParent().findByTestId(key) : cy.byTestId(key))
      .then(($el) => {
        if (inputTagNames.includes($el.prop("tagName").toLowerCase())) {
          return $el;
        }
        return $el.find(inputTagNames.join(", "));
      })
      .then(($el) => {
        // Select input
        if ($el.prop("tagName").toLowerCase() === "select") {
          cy.wrap($el)
            .find(":selected")
            .invoke("text")
            .then(($text) => $text.trim())
            .should("equal", value);
        }
        // Other inputs (such as input/textarea)
        else {
          cy.wrap($el).should("have.value", value);
        }
      });
  }
};

/**
 * Fills a form using provided values.
 * @param form Object with key-value pairs that describe a form: keys are form fields testids, values are form
 * fields values.
 * @param getParent Function that gets an HTML element. If provided, the form fields to fill will be searched
 * for inside that element.
 */
export const fillForm = (
  form: { [key: string]: any },
  getParent?: () => Cypress.Chainable
) => {
  for (const [key, value] of Object.entries(form)) {
    (getParent ? getParent().findByTestId(key) : cy.byTestId(key)).then(
      ($el) => {
        // Items list input (custom input)
        if (Array.isArray(value)) {
          cy.wrap($el).type(value.map((link) => link + "{enter}").join(""));
        }
        // Select input
        else if ($el.prop("tagName").toLowerCase() === "select") {
          cy.wrap($el).select(value);
        }
        // Other inputs (such as input/textarea)
        else {
          cy.wrap($el).type(value);
        }
      }
    );
  }
};

/**
 * Creates a cabin.
 * @param needLogin Whether the user needs to login as admin. If true, admin login is performed before everything else.
 * @param navigate Whether navigation to the cabins list page is needed. Leave it false if current page is cabins list.
 * @returns Object that describes the form used to create the cabin. It contains key-value pairs: keys are form fields
 * testids, values are form fields values.
 */
export const createCabin = (needLogin = false, navigate = false) => {
  if (needLogin) {
    adminLogin(true);
  }
  if (navigate) {
    cy.intercept("/api/cabins").as("getCabins");
    cy.visit("/cabins-list");
  }
  cy.wait("@getCabins");

  cy.byTestId("add-cabin-button").click();
  cy.byTestId("cabin-form").should("be.visible");

  const form = {
    name: getRandomizedString("e2e cabin name "),
    description: getRandomizedString("e2e cabin description "),
    latitude: "41.2342",
    longitude: "9.2347",
    altitude: "3702",
    type: "managed",
    material: "metal",
    "external-links": ["e2e.org", "jojobestanime.ru"],
  };

  fillForm(form, () => cy.byTestId("cabin-form"));

  // TODO test image uploader
  // getFormElement("image-button")
  // getFormElement("remove-image-button")
  cy.byTestId("cabin-form").find("button[type='submit']").click();

  return form;
};

/**
 * Deletes a cabin.
 * @param searchString String to search for in order to find the cabin as the only result (e.g. name of the cabin).
 * @param needLogin Whether the user needs to login as admin. If true, admin login is performed before everything else.
 * @param navigate Whether navigation to the cabins list page is needed. Leave it false if current page is cabins list.
 */
export const deleteCabin = (
  searchString?: string,
  needLogin = false,
  navigate = false
) => {
  if (needLogin) {
    adminLogin(true);
  }
  if (navigate) {
    cy.intercept("/api/cabins").as("getCabins");
    cy.visit("/cabins-list");
  }
  cy.wait("@getCabins");

  if (searchString) {
    search(searchString, true);
  }
  getTableRows().should("have.length", 1);
  cy.byTestId("delete-button").click();
  cy.byTestId("confirm-modal").findByTestId("confirm-button").click();
  getTableRows().should("have.length", 0);
};
