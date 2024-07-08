export type NonNull<T> = {
  [P in keyof T]: Exclude<T[P], null>;
};
