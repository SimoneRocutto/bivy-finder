import { CommonModule } from "@angular/common";
import {
  Component,
  ContentChild,
  Directive,
  ElementRef,
  TemplateRef,
  ViewChild,
} from "@angular/core";

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
    <div class="relative">
      <div (click)="toggleDropdown()" #dropdownHead>
        <ng-content head></ng-content>
      </div>
      <div
        class="min-w-8 absolute right-0 flex flex-col gap-1 bg-white border border-black"
        *ngIf="open"
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
  @ViewChild("dropdownHead") dropdownHead?: ElementRef<HTMLElement>;
  open = false;

  toggleDropdown = () => {
    this.open ? this.closeDropdown() : this.openDropdown();
  };

  openDropdown = () => {
    this.open = true;

    // Without this, the event callback will be immediately fired.
    setTimeout(() => {
      window.addEventListener(
        "click",
        (e) => {
          // If we open the dropdown, then click on the head, we want to close the dropdown.
          // Without this if clause, the dropdown would close and then immediately toggle,
          // which would result in an open dropdown.
          if (
            this?.dropdownHead?.nativeElement?.contains(e.target as HTMLElement)
          ) {
            return;
          }
          this.open = false;
        },
        {
          once: true,
        }
      );
    }, 0);
  };

  closeDropdown = () => {
    this.open = false;
  };
}
