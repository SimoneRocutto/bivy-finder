import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { PaginationComponent } from "../pagination/pagination.component";
import { FormsModule } from "@angular/forms";
import { TableColumn } from "./table.type";
import { sortObjectsByProp } from "../../../helpers/misc";

@Component({
  selector: "app-table",
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <label class="input input-bordered flex items-center gap-2 mb-4 mx-4">
      <input
        type="text"
        class="grow"
        placeholder="Search"
        [(ngModel)]="filterString"
        (input)="filterItems()"
      />
      <i class="material-symbols-outlined">search</i>
    </label>
    <app-pagination
      [items]="filteredItems"
      [(pageNumber)]="pageNumber"
      [pageSize]="pageSize"
      [isLoading]="isLoading"
      [extraPageButtons]="extraPageButtons"
      (onPageChange)="setShownItems($event)"
    ></app-pagination>
    <div class="my-6 max-w-screen">
      <table class="table" [ngClass]="{ 'table-zebra-zebra': !isLoading }">
        <thead>
          <tr class="flex flex-row">
            <th class="w-16"></th>
            <ng-container *ngFor="let col of columns">
              <th *ngIf="!col.hidden" class="flex-1">
                <button (click)="sortItems(col.prop)">{{ col.name }}</button>
              </th>
            </ng-container>
            <th class="flex-1" *ngIf="afterCell"></th>
          </tr>
        </thead>
        <tbody>
          <ng-container *ngIf="!isLoading; else skeleton">
            <tr *ngFor="let item of shownItems" class="flex flex-row">
              <ng-container
                *ngTemplateOutlet="beforeCell; context: { $implicit: item }"
              ></ng-container>
              <ng-container *ngFor="let col of columns">
                <td
                  *ngIf="!col.hidden"
                  class="flex-1 overflow-x-auto"
                  [ngClass]="{
                    'first-letter:uppercase':
                      col.style?.textTransform === 'capitalize',
                    uppercase: col.style?.textTransform === 'uppercase',
                    lowercase: col.style?.textTransform === 'lowercase'
                  }"
                >
                  <ng-container *ngIf="col.transform; else defaultValue">{{
                    col.transform(item[col.prop])
                  }}</ng-container>
                  <ng-template #defaultValue>
                    {{ item[col.prop] }}
                  </ng-template>
                </td>
              </ng-container>
              <ng-container
                *ngTemplateOutlet="afterCell; context: { $implicit: item }"
              ></ng-container>
            </tr>
          </ng-container>

          <ng-template #skeleton>
            <tr
              *ngFor="let item of [].constructor(pageSize)"
              class="w-full flex flex-row gap-4 my-6"
            >
              <td class="skeleton h-8 w-12"></td>
              <ng-container *ngFor="let col of columns">
                <ng-container *ngIf="!col.hidden">
                  <td class="skeleton h-8 flex-1"></td>
                </ng-container>
              </ng-container>
            </tr>
          </ng-template>
        </tbody>
      </table>
    </div>
    <app-pagination
      [items]="filteredItems"
      [pageSize]="pageSize"
      [(pageNumber)]="pageNumber"
      [isLoading]="isLoading"
      [extraPageButtons]="extraPageButtons"
      (onPageChange)="setShownItems($event)"
    ></app-pagination>
  `,
  styles: `.max-w-screen {
    max-width: 100vw;
  }`,
})
export class TableComponent<TableItem extends { [key: string]: any }>
  implements OnInit, OnDestroy
{
  @ViewChild(PaginationComponent) pagination!: PaginationComponent;
  @Input() beforeCell: TemplateRef<any> | null = null;
  @Input() afterCell: TemplateRef<any> | null = null;
  @Input() pageSize = 50;
  @Input() columns: TableColumn<TableItem>[] = [];
  @Input() isLoading = false;

  get filterFields(): (keyof TableItem)[] {
    return this.columns.filter((col) => col.filter).map((col) => col.prop);
  }

  get defaultSortProp(): keyof TableItem | undefined {
    return this.columns.find((col) => col.defaultSort)?.prop;
  }

  pageNumber = 1;

  extraPageButtons = 2;

  private _items: TableItem[] = [];
  @Input() set items(value: TableItem[]) {
    this._items = value;
    this.filterItems(false);
    // If items are less than before, pageNumber could be more than max
    const sortProp = this.currentSortProp ?? this.defaultSortProp;
    if (!sortProp) {
      this.softRefreshPage(false, false);
    } else {
      this.sortItems(sortProp, true, false);
    }
  }

  filteredItems: TableItem[] = [];
  shownItems: TableItem[] = [];

  filterString = "";

  currentSortProp?: keyof TableItem;
  reverseSort = false;

  ngOnInit(): void {
    this.adjustPagination();
    window.addEventListener("resize", this.adjustPagination);
  }

  ngOnDestroy(): void {
    window.removeEventListener("resize", this.adjustPagination);
  }

  adjustPagination = () => {
    if (window.matchMedia("only screen and (max-width: 768px)").matches) {
      this.extraPageButtons = 0;
    } else {
      this.extraPageButtons = 2;
    }
  };

  setShownItems = (items: TableItem[]) => {
    this.shownItems = items;
  };

  /**
   * Filters table items by the filterString. If the string is empty, all items are shown.
   * @param refresh Whether to refresh the page after filtering
   */
  filterItems = (refresh = true) => {
    if (this.filterString === "") {
      this.filteredItems = this._items;
    } else {
      const transforms = this.columns.reduce((acc, curr) => {
        if (curr.transform) {
          acc[curr.prop] = curr.transform;
        }
        return acc;
      }, {} as { [key in keyof TableItem]: any });
      this.filteredItems = this._items.filter((item) =>
        this.filterFields.some((field) => {
          const transformeditem =
            field in transforms ? transforms[field](item[field]) : item[field];
          return this.toStringForFilter(transformeditem)
            .toLowerCase()
            .includes(this.filterString.toLowerCase());
        })
      );
    }
    if (refresh) {
      this.softRefreshPage(false, true);
    }
  };

  /**
   * Sorts table items by an item property, handling more complex logic than sortItemsSimple (see params descriptions).
   * @param prop Item property to sort by
   * @param ignoreReverse If false, the sort direction will be reversed if the current sort prop is the same
   * @param resetPage Whether to go back to page 1 after the sorting is done
   */
  sortItems = (
    prop: keyof TableItem,
    ignoreReverse = false,
    resetPage = true
  ) => {
    const reverseSort = ignoreReverse
      ? this.reverseSort
      : this.currentSortProp === prop && !this.reverseSort;
    this.sortItemsSimple(prop, reverseSort);
    this.currentSortProp = prop;
    this.reverseSort = reverseSort;
    this.softRefreshPage(false, resetPage);
  };

  /**
   * Converts an item to string in order to use it in the filter. Supports strings, numbers and objects. All other types are ignored.
   * @param item Item to convert to string
   * @returns Converted item
   */
  private toStringForFilter = (item: any): string => {
    switch (typeof item) {
      case "string":
        return item;
      case "number" || "object":
        return item + "";
      default:
        return "";
    }
  };

  /**
   * Refreshes the current pagination page. "Soft" means
   * that we are not refetching the list of items from the backend.
   * @param sort - whether to sort the items
   */
  private softRefreshPage = (
    sort: boolean = false,
    resetPage: boolean = false
  ) => {
    setTimeout(() => {
      if (sort) {
        this.sortItemsSimple();
      }
      if (resetPage) {
        this.pageNumber = 1;
      }
      this.pagination.setPage(this.pageNumber);
    }, 0);
  };

  /**
   * Sorts table items by a property. Sorting happens after filtering by filterString.
   * This function does only the sorting, for all the other logic see sortItems.
   * @param prop Item property to sort by
   * @param reverse Whether to sort in reverse order
   */
  private sortItemsSimple = (
    prop: keyof TableItem | undefined = this.currentSortProp ??
      this.defaultSortProp,
    reverse: boolean = this.reverseSort
  ) => {
    if (prop) {
      const transform = this.columns.find(
        (col) => col.prop === prop
      )?.transform;
      sortObjectsByProp(this.filteredItems, prop, reverse, transform);
    }
  };
}
