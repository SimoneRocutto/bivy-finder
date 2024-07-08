import { NonNull } from "../types/misc.type";

// Todo This is not currently used. Delete it if it's not needed.
/**
 * Parses an object, returning a new object with null values converted to undefined
 * @param obj Object to parse
 * @returns New object
 */
export const nullValuesToUndefined = <T extends {}>(obj: T): NonNull<T> =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key] = value ?? undefined;
    return acc;
  }, {} as NonNull<T>);
