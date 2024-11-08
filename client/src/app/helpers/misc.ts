import { NonNull } from "../types/misc.type";

// Todo This is not currently used. Delete it if it's not needed.
/**
 * Parses an object, returning a new object with null values converted to undefined.
 * @param obj Object to parse
 * @returns New object
 */
export const nullValuesToUndefined = <T extends {}>(obj: T): NonNull<T> =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key] = value ?? undefined;
    return acc;
  }, {} as NonNull<T>);

/**
 * Sorts an array of objects by a property in place.
 * @param items Array of objects
 * @param prop Object property to sort by
 * @param reverse Whether to sort in reverse order
 * @param transform Function to transform the value before sorting.
 * The transformation is only made for sorting purposes, the value inside the
 * object is not changed.
 * @returns Sorted array
 */
export const sortObjectsByProp = <T extends {}>(
  items: T[],
  prop: keyof T,
  reverse: boolean = false,
  transform?: (value: T[keyof T] | undefined) => string
) =>
  items.toSorted((a, b) => {
    const [propA, propB] = [a[prop], b[prop]]
      .map((item) => (transform ? transform(item) : item))
      .map((item) => (item ?? "").toString().toLowerCase());
    return ((propA ?? "") < (propB ?? "") ? -1 : 1) * (reverse ? -1 : 1);
  });

/**
 * Converts milliseconds to human readable format (d, h, m).
 * @param msTime Time to convert (in milliseconds)
 * @returns An array of 3 elements. First element is the number of days, second element is the number of hours,
 * third element is the number of minutes.
 */
export const msToHuman = (
  msTime?: number
): [number, number, number] | [undefined, undefined, undefined] => {
  if (!msTime) {
    return [undefined, undefined, undefined];
  }
  const units = [1000 * 60 * 60 * 24, 1000 * 60 * 60, 1000 * 60];
  return units.reduce(
    (valuesAndRest: [number[], number], currUnit) => {
      const [values, previousRest] = valuesAndRest;
      const value = Math.floor(previousRest / currUnit);
      const rest = previousRest % currUnit;
      values.push(value);
      valuesAndRest[1] = rest;
      return valuesAndRest;
    },
    [[], msTime]
  )[0] as [number, number, number];
};

/**
 * Converts human readable format (d, h, m) to milliseconds.
 * @param humanTime Array of 3 elements. First element is the number of days, second element is the number of hours,
 * third element is the number of minutes.
 * @returns
 */
export const humanToMs = (humanTime: [number, number, number]) => {
  const units = [1000 * 60 * 60 * 24, 1000 * 60 * 60, 1000 * 60];
  return units
    .map((unit, index) => humanTime[index] * unit)
    .reduce((acc, curr) => acc + curr, 0);
};

export const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);
