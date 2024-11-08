import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-pagination-button",
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="join-item btn"
      [ngClass]="{ 'btn-active': active, 'btn-disabled': disabled }"
      [ngStyle]="{ width: (buttonWidth ?? defaultButtonWidth) + 'rem' }"
      (click)="onClick.emit()"
      data-testid="pagination-button"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: ``,
})
export class PaginationButtonComponent {
  @Input() active = false;
  @Input() disabled = false;
  @Input() buttonWidth?: number;
  defaultButtonWidth = 3;
  @Output() onClick = new EventEmitter();
}
