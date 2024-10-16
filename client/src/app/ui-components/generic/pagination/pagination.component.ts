import { Component, EventEmitter, Input, Output } from "@angular/core";
import { PaginationButtonComponent } from "./pagination-button/pagination-button.component";
import { PaginationNumberButtonComponent } from "./pagination-number-button/pagination-number-button.component";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-pagination",
  standalone: true,
  imports: [
    CommonModule,
    PaginationButtonComponent,
    PaginationNumberButtonComponent,
  ],
  template: `
    <div
      class="join flex flex-row justify-between"
      [ngStyle]="{
        width: buttonWidth * (extraPageButtons * 2 + 1 + 2 + 2 + 2) + 'rem'
      }"
    >
      <app-pagination-button
        (onClick)="setPage(_pageNumber - 1)"
        [disabled]="_pageNumber <= 1"
        [buttonWidth]="buttonWidth"
        ><</app-pagination-button
      >
      <div *ngIf="!isLoading; else skeleton">
        <ng-container
          *ngIf="pagesCount <= extraPageButtons * 2 + 3; else compactPagination"
        >
          <app-pagination-number-button
            *ngFor="let e of [].constructor(pagesCount); let i = index"
            [buttonPageNumber]="i + 1"
            [currentPageNumber]="_pageNumber"
            [buttonWidth]="buttonWidth"
            (onClick)="setPage($event)"
          ></app-pagination-number-button>
        </ng-container>
        <ng-template #compactPagination>
          <ng-container *ngIf="_pageNumber > extraPageButtons + 1">
            <app-pagination-number-button
              [buttonPageNumber]="1"
              [currentPageNumber]="_pageNumber"
              [buttonWidth]="buttonWidth"
              (onClick)="setPage($event)"
            ></app-pagination-number-button>
            <app-pagination-button
              *ngIf="_pageNumber > extraPageButtons + 2"
              [disabled]="true"
              [buttonWidth]="buttonWidth"
            >
              ...
            </app-pagination-button>
          </ng-container>
          <app-pagination-number-button
            *ngFor="
              let e of [].constructor(2 * extraPageButtons + 1);
              let i = index
            "
            [buttonPageNumber]="limitPageNumber + i"
            [currentPageNumber]="_pageNumber"
            [buttonWidth]="buttonWidth"
            (onClick)="setPage($event)"
          ></app-pagination-number-button>
          <ng-container *ngIf="_pageNumber < pagesCount - extraPageButtons">
            <app-pagination-button
              *ngIf="_pageNumber < pagesCount - extraPageButtons - 1"
              [disabled]="true"
              [buttonWidth]="buttonWidth"
            >
              ...
            </app-pagination-button>
            <app-pagination-number-button
              [buttonPageNumber]="pagesCount"
              [currentPageNumber]="_pageNumber"
              [buttonWidth]="buttonWidth"
              (onClick)="setPage($event)"
            ></app-pagination-number-button>
          </ng-container>
        </ng-template>
      </div>
      <ng-template #skeleton
        ><div data-testid="skeleton" class="skeleton grow mx-12"></div
      ></ng-template>
      <app-pagination-button
        [disabled]="_pageNumber >= pagesCount"
        [buttonWidth]="buttonWidth"
        (onClick)="setPage(_pageNumber + 1)"
        >></app-pagination-button
      >
    </div>
  `,
  styles: `:host {
    display: flex;
    justify-content: center;
  }`,
})
export class PaginationComponent {
  // For now, I'll use frontend pagination because
  // the total number of cabins is not that big,
  // and probably will never be.
  @Input() pageSize = 50;
  @Input() extraPageButtons = 2;
  _items: any[] = [];
  @Input() set items(items: any[]) {
    this._items = items;
    this.refreshItems();
  }
  @Output() onPageChange = new EventEmitter<any[]>();
  @Output() pageNumberChange = new EventEmitter<number>();

  _pageNumber = 1;
  @Input() set pageNumber(pageNumber: number) {
    this.setPage(pageNumber, true);
  }
  @Input() isLoading = false;

  /**  Width of each button (rem) */
  buttonWidth = 3;

  get limitPageNumber() {
    return this._pageNumber - this.extraPageButtons < 1
      ? 1
      : this._pageNumber + this.extraPageButtons > this.pagesCount
      ? this.pagesCount - 2 * this.extraPageButtons
      : this._pageNumber - this.extraPageButtons;
  }

  get pagesCount() {
    const count = Math.ceil(this._items.length / this.pageSize);
    // We need at least one page
    return count > 0 ? count : 1;
  }

  private fixPageNumber = (pageNumber: number): number => {
    if (pageNumber > this.pagesCount) {
      return this.pagesCount;
    }
    if (pageNumber < 1) {
      return 1;
    }
    return pageNumber;
  };

  /**
   * Sets page number.
   * @param inputPageNumber Page number we want to set.
   * @param noFix If false, page number is bound to be between 1 and the max page
   * number. This causes some problems when the items are not loaded yet: that's when
   * it can be useful to set it to true.
   */
  setPage = (inputPageNumber: number, noFix = false) => {
    let pageNumber = inputPageNumber;
    if (!noFix) {
      pageNumber = this.fixPageNumber(inputPageNumber);
    }
    this._pageNumber = pageNumber;
    this.pageNumberChange.emit(pageNumber);
    this.refreshItems(pageNumber);
  };

  private refreshItems = (pageNumber = this._pageNumber) => {
    this.onPageChange.emit(
      this._items.slice(
        (pageNumber - 1) * this.pageSize,
        pageNumber * this.pageSize
      )
    );
  };
}
