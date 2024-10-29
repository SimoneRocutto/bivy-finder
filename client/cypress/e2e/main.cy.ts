describe("Cabins map", () => {
  const clickUserAreaLink = (label: string) => {
    cy.byTestId("user-area-button").click();
    const loginLink = cy
      .byTestId("user-area-dropdown")
      .find("li")
      .contains(label, { matchCase: false });
    loginLink.click();
  };

  beforeEach(() => {
    cy.intercept("/api/auth/check-login").as("checkLogin");
    cy.visit("/");
    cy.wait("@checkLogin");
  });

  it("Redirects to cabins map", () => {
    cy.expectUrl("/cabins-map");
  });

  it("Shows the correct title", () => {
    cy.title().should(
      "equal",
      "Mountain Cabins - Trova bivacchi nel Nord Italia"
    );
  });

  it("Opens and closes the sidebar", () => {
    cy.byTestId("sidebar-content").should("not.be.visible");
    cy.byTestId("sidebar-toggle-button").click();
    cy.byTestId("sidebar-content").should("be.visible");
    cy.byTestId("sidebar-overlay").click();
    cy.byTestId("sidebar-content").should("not.be.visible");
  });

  it("Changes page when clicking on sidebar links", () => {
    cy.byTestId("sidebar-content").should("not.be.visible");
    cy.byTestId("sidebar-toggle-button").click();
    cy.byTestId("sidebar-link").contains("Cabins List").click();
    cy.expectUrl("/cabins-list");
    // Sidebar should be hidden after changing url
    cy.byTestId("sidebar-content").should("not.be.visible");
  });

  it("Opens and closes the user area content", () => {
    cy.byTestId("user-area-dropdown").should("not.be.visible");
    cy.byTestId("user-area-button").click();
    cy.byTestId("user-area-dropdown").should("be.visible");
    cy.get("body").click();
    cy.byTestId("user-area-dropdown").should("not.be.visible");
  });

  it("Goes to login page", () => {
    clickUserAreaLink("login");
    cy.expectUrl("/login");
  });

  it("Goes to signup page", () => {
    clickUserAreaLink("sign up");
    cy.expectUrl("/sign-up");
  });
});
