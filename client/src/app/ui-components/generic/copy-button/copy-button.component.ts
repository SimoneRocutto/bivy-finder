import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, Input } from "@angular/core";
import { TooltipComponent } from "../tooltip/tooltip.component";

@Component({
  selector: "app-copy-button",
  standalone: true,
  imports: [CommonModule, TooltipComponent],
  template: `
    <app-tooltip
      [label]="successMessage"
      [disabled]="!justCopied"
      [forceOpen]="true"
    >
      <button
        class="btn btn-neutral btn-sm"
        [ngClass]="{ 'btn-circle': circularButton }"
        (click)="copyCoordinatesToClipboard()"
      >
        <i class="material-symbols-outlined text-lg">{{
          justCopied ? "done" : icon
        }}</i>
      </button>
    </app-tooltip>
  `,
  styles: ``,
})
export class CopyButtonComponent {
  @Input() text: string = "";
  @Input() successMessage: string = "Copied!";
  @Input() icon: string = "content_copy";
  @Input() circularButton = false;

  justCopied = false;

  copyTimeout?: ReturnType<typeof setTimeout>;

  animationDuration = 2000;

  constructor(private changeDetector: ChangeDetectorRef) {}

  copyCoordinatesToClipboard = () => {
    this.justCopied = true;

    navigator.clipboard.writeText(this.text);

    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }

    this.copyTimeout = setTimeout(() => {
      this.justCopied = false;
      this.changeDetector.detectChanges();
    }, this.animationDuration);

    this.changeDetector.detectChanges();
  };
}
