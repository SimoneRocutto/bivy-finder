export const getElementStyle = (element: HTMLElement, pseudoElement?: string) =>
  window.getComputedStyle(element, pseudoElement);

/**
 * Gets the computed style of the ::before pseudoelement at this moment in time.
 * @param element Element which has the ::before pseudoelement.
 */
export const getBefore = (element: HTMLElement) =>
  getElementStyle(element, ":before");

/**
 * Gets the computed style of the ::after pseudoelement at this moment in time.
 * @param element Element which has the ::after pseudoelement.
 */
export const getAfter = (element: HTMLElement) =>
  getElementStyle(element, ":after");

/**
 * Waits until specified time has passed.
 * @param timeout Time to wait in milliseconds.
 */
export const asyncTimeout = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(timeout);
    }, timeout);
  });
};
