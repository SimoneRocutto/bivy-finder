import { Component, effect, EventEmitter, input, Output } from "@angular/core";
import { FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { Employee } from "../employee";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-employee-form",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styles: `
    .employee-form {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 2rem;
    }

.employee-form {
  width: 100%;
  max-width: 400px;
  margin: 20px auto;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.input-error {
  color: #dc3545;
  font-size: 14px;
}

.btn {
  cursor: pointer;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

  `,
  template: `
    <form
      class="employee-form"
      autocomplete="off"
      [formGroup]="employeeForm"
      (submit)="submitForm()"
    >
      <div class="form-group">
        <label for="name">Name</label>
        <input
          type="text"
          id="name"
          class="form-control"
          placeholder="Name"
          formControlName="name"
          required
        />
        <div
          *ngIf="
            employeeForm.get('name')?.invalid &&
            employeeForm.get('name')?.touched
          "
          class="error-message"
        >
          Name must be at least 3 characters long.
        </div>
      </div>

      <div class="form-group">
        <label for="position">Position</label>
        <input
          type="text"
          id="position"
          class="form-control"
          placeholder="Position"
          formControlName="position"
          required
        />
        <div
          *ngIf="
            employeeForm.get('position')?.invalid &&
            employeeForm.get('position')?.touched
          "
          class="error-message"
        >
          Position must be at least 5 characters long.
        </div>
      </div>

      <div class="form-group">
        <label>Level</label>
        <div>
          <input
            type="radio"
            id="junior"
            name="level"
            value="junior"
            formControlName="level"
            required
          />
          <label for="junior">Junior</label>
        </div>
        <div>
          <input
            type="radio"
            id="mid"
            name="level"
            value="mid"
            formControlName="level"
          />
          <label for="mid">Mid</label>
        </div>
        <div>
          <input
            type="radio"
            id="senior"
            name="level"
            value="senior"
            formControlName="level"
          />
          <label for="senior">Senior</label>
        </div>
      </div>

      <button
        class="btn btn-primary"
        type="submit"
        [disabled]="employeeForm.invalid"
      >
        Add
      </button>
    </form>
  `,
})
export class EmployeeFormComponent {
  initialState = input<Employee>();

  @Output()
  formValuesChanged = new EventEmitter<Employee>();

  @Output()
  formSubmitted = new EventEmitter<Employee>();

  employeeForm = this.formBuilder.group({
    name: ["", [Validators.required, Validators.minLength(3)]],
    position: ["", [Validators.required, Validators.minLength(5)]],
    level: ["junior", [Validators.required]],
  });

  constructor(private formBuilder: FormBuilder) {
    effect(() => {
      this.employeeForm.setValue({
        name: this.initialState()?.name || "",
        position: this.initialState()?.position || "",
        level: this.initialState()?.level || "junior",
      });
    });
  }

  get name() {
    return this.employeeForm.get("name")!;
  }
  get position() {
    return this.employeeForm.get("position")!;
  }
  get level() {
    return this.employeeForm.get("level")!;
  }

  submitForm() {
    this.formSubmitted.emit(this.employeeForm.value as Employee);
  }
}
