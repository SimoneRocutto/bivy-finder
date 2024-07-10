/**
 * - name: name of the column
 * - hidden: if the column should be hidden
 * - prop: name of the property in the table item
 * - filter: if the column should be used for the filter
 * - defaultSort: if the prop should be used as the default sort prop
 * - transform: function to transform the prop before displaying it
 */
interface TableColumnCommon<T extends { [key: string]: any }> {
  prop: keyof T;
  filter?: boolean;
  defaultSort?: boolean;
  style?: {
    textTransform?: "capitalize" | "uppercase" | "lowercase";
  };
  transform?: (value: T[keyof T] | undefined) => string;
}
interface TableShownColumn<T extends { [key: string]: any }>
  extends TableColumnCommon<T> {
  name: string;
  hidden?: false;
}
interface TableHiddenColumn<T extends { [key: string]: any }>
  extends TableColumnCommon<T> {
  name?: string;
  hidden: true;
}

export type TableColumn<T extends { [key: string]: any }> =
  | TableShownColumn<T>
  | TableHiddenColumn<T>;
