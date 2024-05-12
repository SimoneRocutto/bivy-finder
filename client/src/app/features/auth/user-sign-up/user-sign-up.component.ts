import { Component } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ApiService } from "../../../api.service";
import { AuthService } from "../../../auth.service";

@Component({
  selector: "app-user-sign-up",
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="bg-red-400">Sign up</div>
    <form
      [formGroup]="signUpForm"
      (ngSubmit)="onSignUpFormSubmit()"
      class="flex flex-col gap-2"
    >
      <label for="username">Username</label>
      <input
        id="username"
        formControlName="username"
        type="text"
        class="bg-gray-200"
      />
      <label for="password">Password</label>
      <input
        id="password"
        formControlName="password"
        type="password"
        class="bg-gray-200"
      />
      <button
        type="submit"
        [disabled]="!signUpForm.valid"
        class="disabled:text-gray-500 disabled:bg-gray-200"
      >
        Submit
      </button>
    </form>
  `,
  styles: ``,
})
export class UserSignUpComponent {
  signUpForm = this.formBuilder.group({
    username: ["", Validators.required],
    password: ["", Validators.required],
  });
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  onSignUpFormSubmit = () => {
    const { username, password } = this.signUpForm.value;
    if (!username || !password) {
      console.error("Invalid username or password");
      return;
    }
    this.authService.signUp(username, password).subscribe();
  };
}
