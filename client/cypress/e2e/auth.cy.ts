import { adminLogin, login, logout } from "../helpers/auth";
import { getRandomizedString } from "../helpers/main";

describe("Login form", () => {
  beforeEach(() => {
    cy.intercept("/api/auth/check-login").as("checkLogin");
    cy.visit("/login");
    cy.wait("@checkLogin");
  });

  it("Logs in and out", () => {
    adminLogin();
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
    const username = getRandomizedString("e2e user ");
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
