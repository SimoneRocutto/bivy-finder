import { CommonModule } from "@angular/common";
import { FormInputComponent } from "./../../../ui-components/generic/form-input/form-input.component";
import { Component } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../../services/auth.service";
import { catchError, finalize, tap } from "rxjs";
import { ToastService } from "../../../ui-components/generic/toast-box/toast.service";
import { Router } from "@angular/router";
import { TranslocoPipe } from "@jsverse/transloco";

@Component({
  selector: "app-user-sign-up",
  standalone: true,
  imports: [
    CommonModule,
    FormInputComponent,
    ReactiveFormsModule,
    TranslocoPipe,
  ],
  template: `
    <!--  Using Transloco pipe instead of directive because that was causing 
      change detection issues with Cypress!  -->
    <form
      [formGroup]="signUpForm"
      (ngSubmit)="onSignUpFormSubmit()"
      class="flex flex-col grow max-w-72 gap-2 mt-4 mx-8"
      autocomplete="off"
    >
      <app-form-input
        iconName="person"
        [label]="'auth.username' | transloco"
        [formGroup]="signUpForm"
        [autocomplete]="false"
        formControlName="username"
        data-testid="sign-up-username"
      ></app-form-input>
      <app-form-input
        iconName="key"
        [label]="'auth.password' | transloco"
        [formGroup]="signUpForm"
        [autocomplete]="false"
        type="password"
        formControlName="password"
        data-testid="sign-up-password"
      ></app-form-input>
      <app-form-input
        iconName="key"
        [label]="'auth.confirm_password' | transloco"
        [formGroup]="signUpForm"
        [autocomplete]="false"
        type="password"
        formControlName="confirmPassword"
        data-testid="sign-up-confirm-password"
      ></app-form-input>
      <button
        type="submit"
        [disabled]="!signUpForm.valid || isSubmitting"
        class="btn btn-primary"
      >
        <div [ngClass]="{ invisible: isSubmitting }">
          {{ "common.submit" | transloco | titlecase }}
        </div>
        <span
          *ngIf="isSubmitting"
          class="loading loading-dots loading-md absolute"
        ></span>
      </button>
      <div *ngIf="errorMessage" class="w-full text-error text-center">
        {{ errorMessage | transloco }}
      </div>
    </form>
  `,
  styles: `:host {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
  }`,
})
export class UserSignUpComponent {
  isSubmitting = false;

  usernameTaken = false;

  get errorMessage() {
    if (this.signUpForm.errors) {
      if (this.signUpForm.errors["confirmedValidator"]) {
        // Priority to new error: user already knows username must be changed.
        this.usernameTaken = false;
        return "auth.errors.password_mismatch";
      }
    }
    if (this.usernameTaken) {
      return "auth.errors.username_taken";
    }
    return "";
  }

  private matchValidator = (
    controlName: string,
    matchingControlName: string,
    errorMessage: string
  ): ValidatorFn => {
    return (abstractControl: AbstractControl) => {
      const control = abstractControl.get(controlName);
      const matchingControl = abstractControl.get(matchingControlName);
      if (
        matchingControl!.errors &&
        !matchingControl!.errors?.["confirmedValidator"]
      ) {
        return null;
      }

      if (control!.value !== matchingControl!.value) {
        const error = { confirmedValidator: errorMessage };
        matchingControl!.setErrors(error);
        return error;
      } else {
        matchingControl!.setErrors(null);
        return null;
      }
    };
  };

  signUpForm = this.formBuilder.group(
    {
      username: ["", Validators.required],
      password: ["", Validators.required],
      confirmPassword: ["", Validators.required],
    },
    {
      validators: this.matchValidator(
        "password",
        "confirmPassword",
        "Passwords do not match"
      ),
    }
  );

  private defaultRedirectAfterSignup = "/login";

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSignUpFormSubmit = () => {
    this.usernameTaken = false;
    const { username, password } = this.signUpForm.value;
    if (!username || !password) {
      console.error("Invalid username or password");
      return;
    }
    this.isSubmitting = true;
    this.authService
      .signUp(username, password)
      .pipe(
        tap((res) => {
          if (res.body?.status === "success") {
            this.toastService.createToast("Login successful!", "success");
            const returnUrl = this.defaultRedirectAfterSignup;
            this.router.navigateByUrl(returnUrl);
          }
        }),
        catchError((e: any) => {
          if (e?.status === 409) {
            this.usernameTaken = true;
          }
          this.toastService.createToast("Signup failed!", "error");
          throw e;
        }),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe();
  };
}
