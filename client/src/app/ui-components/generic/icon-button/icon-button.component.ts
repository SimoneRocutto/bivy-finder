import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-icon-button",
  standalone: true,
  imports: [],
  template: `
    <button
      (click)="onClick.emit($event)"
      class="flex justify-center items-center"
    >
      <i class="material-symbols-outlined">{{ iconName }}</i>
    </button>
  `,
  styles: ``,
})
export class IconButtonComponent {
  @Output() onClick = new EventEmitter();
  // Material Icons icon. Setting a default so that it's easier to understand
  // something's missing.
  @Input() iconName: string = "close";
}
