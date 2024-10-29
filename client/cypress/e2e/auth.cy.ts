const login = (username: string, password: string) => {
  cy.intercept("/api/auth/login").as("login");
  cy.byTestId("login-username").type(username);
  cy.byTestId("login-password").type(password);
  cy.get("button[type='submit']").click();
  cy.wait("@login");
  cy.getCookie("uniqueSessionId").should("exist");
};

const logout = () => {
  cy.intercept("/api/auth/logout").as("logout");
  cy.byTestId("user-area-button").click();
  const logoutButton = cy
    .byTestId("user-area-dropdown")
    .find("li")
    .contains("logout", { matchCase: false });
  logoutButton.click();
  cy.wait("@logout");
  cy.getCookie("uniqueSessionId").should("not.exist");
};

describe("Login form", () => {
  beforeEach(() => {
    cy.intercept("/api/auth/check-login").as("checkLogin");
    cy.visit("/login");
    cy.wait("@checkLogin");
  });

  it("Logs in and out", () => {
    login("admin", "test-password");
    cy.expectUrl("/cabins-map");
    logout();
  });
});

describe("Sign up form", () => {
  beforeEach(() => {
    cy.intercept("/api/auth/check-login").as("checkLogin");
    cy.visit("/sign-up");
    cy.wait("@checkLogin");
  });

  it("Signs up and logs in", () => {
    const username = "myFavNumberIs => " + Math.ceil(Math.random() * 100000);
    const password = "test-password";
    cy.intercept("/api/auth/sign-up").as("signUp");
    cy.byTestId("sign-up-username").type(username);
    cy.byTestId("sign-up-password").type(password);
    cy.byTestId("sign-up-confirm-password").type(password);
    cy.get("button[type='submit']").click();
    cy.wait("@signUp");
    cy.expectUrl("/login");
    login(username, password);
  });
});
