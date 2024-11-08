/**
 * Clicks on a user area dropdown item.
 * @param label Dropdown item label.
 */
export const clickUserAreaLink = (label: string) => {
  cy.byTestId("user-area-button").click();
  const loginLink = cy
    .byTestId("user-area-dropdown")
    .find("li")
    .contains(label, { matchCase: false });
  loginLink.click();
};

/**
 * Appends several digits to the end of a string. Useful for obtaining unique strings.
 * @param prefix String prefix.
 * @param digits Number of random digits to append.
 * @returns Altered string.
 */
export const getRandomizedString = (prefix: string, digits = 8) =>
  prefix + Math.ceil(Math.random() * 10 ** digits);
