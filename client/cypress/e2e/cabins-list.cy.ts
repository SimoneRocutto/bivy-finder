import { adminLogin } from "../helpers/auth";
import {
  checkForm,
  clickSortButton,
  createCabin,
  deleteCabin,
  expectTableSortedBy,
  fillForm,
  getFirstTableRow,
  getTableRows,
  search,
} from "../helpers/cabins-list";

describe("Cabins list", () => {
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
  // In the future, we could seed known data instead of random data.
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
        // when seeding known data.
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

  it("Shows admin buttons when logged in as admin", () => {
    adminLogin(true);
    cy.wait("@getCabins");
    cy.byTestId("add-cabin-button").should("be.visible");
    cy.byTestId("delete-bulk-button").should("be.visible");
  });

  it("Creates a cabin, then updates it and deletes it", () => {
    const { "external-links": externalLinks, ...mainForm } = createCabin(true);
    search(mainForm.name);
    getTableRows().should("have.length", 1);
    getFirstTableRow()
      .find('[data-tablecellprop="name"]')
      .should("contain.text", mainForm.name);

    cy.byTestId("edit-button").click();

    // Check external links
    cy.byTestId("external-links")
      .findByTestId("items-list-input-item-label")
      .then(($items) => {
        for (const [i, link] of $items.toArray().entries()) {
          cy.wrap(link).should("have.text", externalLinks[i]);
        }
      });

    // Check that form fields have the expected value
    checkForm(mainForm, () => cy.byTestId("cabin-form"));

    cy.byTestId("cabin-form").findByTestId("cancel-button").click();
    deleteCabin();
  });

  it("Creates a cabin with starting spots, then deletes them", () => {
    const spotForms = [
      {
        generalDataForm: {
          "spot-days": "1",
          "spot-hours": "2",
          "spot-minutes": "15",
          "spot-latitude": "41.3564",
          "spot-longitude": "9.1212",
          "spot-altitude": "700",
          "spot-description": "My favorite spot to reach the cabin!",
        },
        carForm: {
          "car-currency": "€",
          "car-cost": 42,
          "car-cost-per": "Hour",
          "car-description": "lmao",
        },
        publicTransportForms: [
          {
            "transport-name": "test-bus",
            "transport-currency": "€",
            "transport-cost": 5,
            "transport-description": "crazy bus",
          },
          {
            "transport-name": "test-train",
            "transport-currency": "$",
            "transport-cost": 2,
            "transport-description": "wonderful train!",
          },
        ],
      },
      {
        generalDataForm: {
          "spot-days": "0",
          "spot-hours": "1",
          "spot-minutes": "30",
          "spot-latitude": "41.5564",
          "spot-longitude": "9.6212",
          "spot-altitude": "903",
          "spot-description": "My least favorite spot to reach the cabin!",
        },
        carForm: {
          "car-currency": "€",
          "car-cost": 6,
          "car-cost-per": "Day",
          "car-description": "Nice parking spot!",
        },
        publicTransportForms: [],
      },
    ];

    // Create cabin, then find it
    const { "external-links": externalLinks, ...mainForm } = createCabin(true);
    search(mainForm.name);
    getTableRows().should("have.length", 1);
    getFirstTableRow()
      .find('[data-tablecellprop="name"]')
      .should("contain.text", mainForm.name);

    cy.byTestId("starting-spots-button").click();

    const findForm = () => cy.byTestId("spot-form").last();

    // Fill spot forms
    for (const {
      generalDataForm,
      carForm,
      publicTransportForms,
    } of spotForms) {
      cy.byTestId("add-spot-button").click();
      cy.byTestId("spot-collapsable").last().click();

      fillForm(generalDataForm, findForm);

      findForm().findByTestId("add-car-button").click();

      fillForm(carForm, () => findForm().findByTestId("car-form"));

      for (const transportForm of publicTransportForms) {
        findForm().findByTestId("add-public-transport-button").click();
        fillForm(transportForm, () =>
          findForm().findByTestId("transport-form").last()
        );
      }
    }

    // Save data
    cy.byTestId("spots-form").find("button[type='submit']").click();

    // Reopen spots modal
    cy.byTestId("starting-spots-button").click();

    // Expand the entire accordion (only considering open modal: the previous one is still
    // there because the closing animation takes time).
    cy.get("dialog:visible")
      .findByTestId("spot-collapsable")
      .click({ multiple: true });

    // Check spot forms
    cy.byTestId("spot-form").each(($spotForm, i) => {
      const currentForm = spotForms[i];
      checkForm(currentForm.generalDataForm, () => cy.wrap($spotForm));
      checkForm(currentForm.carForm, () =>
        cy.wrap($spotForm).findByTestId("car-form")
      );
      cy.wrap($spotForm)
        .findByTestId("transport-form")
        .each(($transportForm, j) => {
          checkForm(currentForm.publicTransportForms[j], () =>
            cy.wrap($transportForm)
          );
        });
    });

    // Delete spots
    cy.byTestId("remove-spot-button").first().click();
    cy.byTestId("remove-spot-button").first().click();

    // Save data
    cy.byTestId("spots-form").find("button[type='submit']").click();
    // Reopen spots modal
    cy.byTestId("starting-spots-button").click();
    // Check that no spots are there anymore
    cy.get("dialog:visible")
      .findByTestId("spot-collapsable")
      .should("have.length", 0);

    // TODO: test car/public transport delete

    // Delete cabin
    cy.get("dialog:visible")
      .findByTestId("spots-form")
      .findByTestId("cancel-button")
      .click();
    deleteCabin();
  });
});
