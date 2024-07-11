import crypto from "crypto";
/**
 * Remove all undefined and null properties from an object. Returned object keeps the same type
 * as the input because we are only removing optional properties.
 * @param obj Object to clean
 * @returns Array of two elements. First element is the clean object, second element is an array of filtered properties
 */
export const objectFalsyFilter = <T extends {}>(obj: T): [T, string[]] => {
  const filteredProps: string[] = [];
  const cleanObject = Object.entries(obj)
    .filter(([key, value]) => {
      if (value === null) {
        filteredProps.push(key);
      }
      return value !== null;
    })
    .reduce((acc: any, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  return [cleanObject, filteredProps];
};

export const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");
