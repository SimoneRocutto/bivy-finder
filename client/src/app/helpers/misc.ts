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
  items.sort((a, b) => {
    const [propA, propB] = [a[prop], b[prop]]
      .map((item) => (transform ? transform(item) : item))
      .map((item) => (item ?? "").toString().toLowerCase());
    return ((propA ?? "") < (propB ?? "") ? -1 : 1) * (reverse ? -1 : 1);
  });
