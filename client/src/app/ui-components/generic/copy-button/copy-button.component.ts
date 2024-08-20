import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, Input } from "@angular/core";
import { TooltipComponent } from "../tooltip/tooltip.component";

@Component({
  selector: "app-copy-button",
  standalone: true,
  imports: [CommonModule, TooltipComponent],
  template: `
    <app-tooltip label="Copied!" [disabled]="!justCopied" [forceOpen]="true">
      <button
        class="btn btn-neutral btn-sm"
        (click)="copyCoordinatesToClipboard()"
      >
        <i class="material-symbols-outlined text-lg">{{
          justCopied ? "done" : "content_copy"
        }}</i>
      </button>
    </app-tooltip>
  `,
  styles: ``,
})
export class CopyButtonComponent {
  @Input() text: string = "";

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
