import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: "app-items-list-input",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1 mb-2" *ngIf="items?.length">
      <div
        *ngFor="let item of items; let i = index"
        class="flex flex-row justify-between items-center"
      >
        <div
          [ngClass]="{ 'text-blue-500': isLink }"
          class="flex flex-row justify-center items-center gap-1"
        >
          <i class="block text-lg material-symbols-outlined" *ngIf="isLink"
            >link</i
          >
          <div>{{ item }}</div>
        </div>
        <button type="button" class="btn btn-ghost" (click)="removeItem(i)">
          <i class="material-symbols-outlined">delete</i>
        </button>
      </div>
    </div>
    <div
      *ngIf="!addIsDisabled"
      class="flex flex-row justify-between items-center gap-2"
    >
      <div
        class="grow"
        [ngClass]="{ tooltip: newItem.invalid }"
        [attr.data-tip]="newItem.invalid ? 'Invalid url' : ''"
      >
        <input
          [formControl]="newItem"
          [disabled]="!this.items"
          [placeholder]="
            inputPlaceHolder
              ? inputPlaceHolder
              : isLink
              ? 'Add new link'
              : 'Add new item'
          "
          type="text"
          class="input input-bordered w-full"
          [ngClass]="{
            'input-error': newItem.invalid && (newItem.dirty || newItem.touched)
          }"
          (keydown.enter)="$event.preventDefault(); pushItem()"
          aria-describedby="new-item-error"
        />
      </div>
      <button
        type="button"
        (click)="pushItem()"
        [disabled]="!this.items || !newItem.value || newItem.invalid"
        class="btn btn-primary"
      >
        <i class="material-symbols-outlined">add</i>
      </button>
    </div>
    <!-- here for aria attribute -->
    <div *ngIf="newItem.invalid" class="text-error hidden" id="new-item-error">
      Invalid url
    </div>
  `,
  styles: ``,
})
export class ItemsListInputComponent {
  @Input() items?: string[] | null;
  @Input() maxItems?: number;
  @Input() isLink = false;
  @Input() inputPlaceHolder;

  urlRegex = new RegExp(
    /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
  );

  newItem = new FormControl("", {
    validators: [Validators.pattern(this.urlRegex)],
  });

  get addIsDisabled() {
    return (
      this.maxItems != null && this.items && this.items.length >= this.maxItems
    );
  }

  pushItem = () => {
    if (!this.newItem.value || this.newItem.invalid || this.addIsDisabled) {
      return;
    }
    this.items?.push(this.newItem.value);
    this.newItem.setValue("");
  };

  removeItem = (index: number) => {
    this.items?.splice(index, 1);
  };
}
