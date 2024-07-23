import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
} from "@angular/core";
import {
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

export const CUSTOM_CONROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FormInputComponent),
  multi: true,
};
@Component({
  selector: "app-form-input",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="indicator grow">
      <span
        *ngIf="isRequired"
        class="indicator-item badge text-orange-500 text-xs material-symbols-outlined"
        >emergency</span
      >
      <label
        class="input input-bordered w-full flex items-center gap-2"
        [ngClass]="{
          'input-error':
            inputField?.invalid && (inputField?.dirty || inputField?.touched)
        }"
      >
        <i *ngIf="iconName" class="material-symbols-outlined">{{ iconName }}</i>
        {{ _labelAsPlaceholder ? "" : (label | titlecase) }}
        <input
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (paste)="onPaste($event)"
          [type]="type"
          class="grow"
          [placeholder]="_labelAsPlaceholder ? (label | titlecase) : ''"
          [step]="step"
          [autocomplete]="this.autocomplete ? '' : 'new-password'"
          [ngClass]="{
            'hide-arrows': type === 'number'
          }"
        />
      </label>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      width: 100%;
    }`,
  providers: [CUSTOM_CONROL_VALUE_ACCESSOR],
})
export class FormInputComponent {
  @Input() type: "text" | "password" | "number" = "text";
  @Input() label = "";
  @Input() iconName?: string;
  @Input() labelAsPlaceholder = false;

  @Input() formGroup?: FormGroup;
  // Required for this component to work
  @Input() formControlName!: string;

  // Number input props
  @Input() step?: number;
  @Input() min?: number;
  @Input() max?: number;

  @Input() autocomplete = true;

  @Output() paste = new EventEmitter<ClipboardEvent>();

  get inputField() {
    return this.formGroup?.get(this.formControlName);
  }
  get isRequired() {
    return this.inputField?.hasValidator(Validators.required);
  }

  // By default, we display the label. If we use an Icon, we show the
  // label in the placeholder of the input (it would take too much space).
  // This is left as an input so we can always customize the behavior.
  get _labelAsPlaceholder() {
    return this.labelAsPlaceholder || !!this.iconName;
  }

  // Control value accessor props and methods (necessary to make this work
  // inside a reactive form)

  value: string | number = "";
  @Output() valueChange = new EventEmitter<string | number>();

  onChange: (value: string) => void = () => {};

  onTouched: () => void = () => {};

  writeValue(value: string | number): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  onInput(event: any): void {
    const value = event.target.value;
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }

  onPaste(event: ClipboardEvent): void {
    this.paste.emit(event);
  }
}
