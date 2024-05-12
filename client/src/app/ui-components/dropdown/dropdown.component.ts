import { CommonModule } from "@angular/common";
import { Component, ContentChild, Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[body]",
  standalone: true,
})
export class DropdownBodyContentDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
@Component({
  selector: "ui-dropdown",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div (click)="toggleDropdown()">
        <ng-content head></ng-content>
      </div>
      <div
        class="absolute flex flex-col gap-1"
        *ngIf="open"
        (click)="closeDropdown()"
      >
        <ng-template [ngTemplateOutlet]="content.templateRef"></ng-template>
      </div>
    </div>
  `,
  styles: ``,
})
export class DropdownComponent {
  @ContentChild(DropdownBodyContentDirective)
  content!: DropdownBodyContentDirective;
  open = false;

  toggleDropdown = () => {
    this.open = !this.open;
  };

  // For now, this is used to close the dropdown after clicking on a
  // child item. However, this behavior will likely be changed in the
  // future to accomodate different needs.
  closeDropdown = () => {
    this.open = false;
  };
}
