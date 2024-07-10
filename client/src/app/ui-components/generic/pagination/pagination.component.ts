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
      *ngIf="items.length > 0"
      [ngStyle]="{
        width: buttonWidth * (extraPageButtons * 2 + 1 + 2 + 2 + 2) + 'rem'
      }"
    >
      <app-pagination-button
        (onClick)="setPage(pageNumber - 1)"
        [disabled]="pageNumber <= 1"
        [buttonWidth]="buttonWidth"
        ><</app-pagination-button
      >
      <div>
        <ng-container
          *ngIf="pagesCount <= extraPageButtons * 2 + 3; else compactPagination"
        >
          <app-pagination-number-button
            *ngFor="let e of [].constructor(pagesCount); let i = index"
            [buttonPageNumber]="i + 1"
            [currentPageNumber]="pageNumber"
            [buttonWidth]="buttonWidth"
            (onClick)="setPage($event)"
          ></app-pagination-number-button>
        </ng-container>
        <ng-template #compactPagination>
          <ng-container *ngIf="pageNumber > extraPageButtons + 1">
            <app-pagination-number-button
              [buttonPageNumber]="1"
              [currentPageNumber]="pageNumber"
              [buttonWidth]="buttonWidth"
              (onClick)="setPage($event)"
            ></app-pagination-number-button>
            <app-pagination-button
              *ngIf="pageNumber > extraPageButtons + 2"
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
            [currentPageNumber]="pageNumber"
            [buttonWidth]="buttonWidth"
            (onClick)="setPage($event)"
          ></app-pagination-number-button>
          <ng-container *ngIf="pageNumber < pagesCount - extraPageButtons">
            <app-pagination-button
              *ngIf="pageNumber < pagesCount - extraPageButtons - 1"
              [disabled]="true"
              [buttonWidth]="buttonWidth"
            >
              ...
            </app-pagination-button>
            <app-pagination-number-button
              [buttonPageNumber]="pagesCount"
              [currentPageNumber]="pageNumber"
              [buttonWidth]="buttonWidth"
              (onClick)="setPage($event)"
            ></app-pagination-number-button>
          </ng-container>
        </ng-template>
      </div>
      <app-pagination-button
        [disabled]="pageNumber >= pagesCount"
        [buttonWidth]="buttonWidth"
        (onClick)="setPage(pageNumber + 1)"
        >></app-pagination-button
      >
    </div>
  `,
  styles: ``,
})
export class PaginationComponent {
  // For now, I'll use frontend pagination because
  // the total number of bivouacs is not that big,
  // and probably will never be.
  @Input() pageSize = 50;
  @Input() extraPageButtons = 2;
  @Input() items: any[] = [];
  @Input() shownItems: any[] = [];
  @Output() onPageChange = new EventEmitter<any[]>();
  @Output() pageNumberChange = new EventEmitter<number>();
  @Input() pageNumber = 1;

  /**  Width of each button (rem) */
  buttonWidth = 3;

  get limitPageNumber() {
    return this.pageNumber - this.extraPageButtons < 1
      ? 1
      : this.pageNumber + this.extraPageButtons > this.pagesCount
      ? this.pagesCount - 2 * this.extraPageButtons
      : this.pageNumber - this.extraPageButtons;
  }

  get pagesCount() {
    const count = Math.ceil(this.items.length / this.pageSize);
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

  setPage = (inputPageNumber: number) => {
    const pageNumber = this.fixPageNumber(inputPageNumber);
    this.pageNumber = pageNumber;
    this.pageNumberChange.emit(pageNumber);
    this.onPageChange.emit(
      this.items.slice(
        (pageNumber - 1) * this.pageSize,
        pageNumber * this.pageSize
      )
    );
  };
}
