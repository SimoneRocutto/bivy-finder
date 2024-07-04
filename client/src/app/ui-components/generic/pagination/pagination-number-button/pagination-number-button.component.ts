import { Component, EventEmitter, Input, Output } from "@angular/core";
import { PaginationButtonComponent } from "../pagination-button/pagination-button.component";

@Component({
  selector: "app-pagination-number-button",
  standalone: true,
  imports: [PaginationButtonComponent],
  template: `
    <app-pagination-button
      (onClick)="onClick.emit(buttonPageNumber)"
      [active]="buttonPageNumber === currentPageNumber"
      [buttonWidth]="buttonWidth"
      >{{ buttonPageNumber }}</app-pagination-button
    >
  `,
  styles: ``,
})
export class PaginationNumberButtonComponent {
  @Input() currentPageNumber: number = 1;
  @Input() buttonPageNumber: number = 1;
  @Input() buttonWidth?: number;
  @Output() onClick = new EventEmitter();
}
