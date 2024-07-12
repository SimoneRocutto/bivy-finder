import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-tooltip",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [attr.data-tip]="label"
      class="tooltip w-full"
      [ngClass]="{ 'tooltip-open': forceOpen, 'tooltip-hidden': disabled }"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: ``,
})
export class TooltipComponent {
  @Input() label = "";
  @Input() forceOpen = false;
  @Input() disabled = false;
}
