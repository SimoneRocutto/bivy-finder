import { clickUserAreaLink } from "./main";

/**
 * Performs user login.
 * @param username
 * @param password
 * @param navigate Whether navigation to the login page is needed. Leave it false if current page is login.
 */
export const login = (username: string, password: string, navigate = false) => {
  if (navigate) {
    clickUserAreaLink("login");
  }
  cy.intercept("/api/auth/login").as("login");
  cy.byTestId("login-username").type(username);
  cy.byTestId("login-password").type(password);
  cy.get("button[type='submit']").click();
  cy.wait("@login");
  cy.getCookie("uniqueSessionId").should("exist");
};

/**
 * Performs admin login.
 * @param navigate Whether navigation to the login page is needed. Leave it false if current page is login.
 */
export const adminLogin = (navigate = false) => {
  cy.fixture("admin-user").then((admin) => {
    login(admin.username, admin.password, navigate);
  });
};

/**
 * Performs user logout.
 */
export const logout = () => {
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
