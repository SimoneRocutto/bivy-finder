describe("Cabins map", () => {
  beforeEach(() => {
    cy.intercept("/api/auth/check-login").as("checkLogin");
    cy.intercept("/api/cabins").as("getCabins");
    cy.visit("/");
    cy.wait("@checkLogin");
    cy.wait("@getCabins");
  });

  it("Opens and closes map filters", () => {
    cy.byTestId("map-filters").should("not.exist");
    cy.byTestId("open-map-filters-button").click();
    cy.byTestId("map-filters").should("be.visible");
    cy.byTestId("map-filters-cancel-button").click();
    cy.byTestId("map-filters").should("not.exist");
  });
});
