/**
 * Remove all undefined and null properties from an object
 * @param obj Object to clean
 * @returns Array of two elements. First element is the clean object, second element is an array of filtered properties
 */
export const objectFalsyFilter = (obj: {}): [{}, string[]] => {
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
