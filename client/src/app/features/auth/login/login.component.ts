import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../services/auth.service";
import { TranslocoDirective } from "@jsverse/transloco";
import { catchError, finalize, tap } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastService } from "../../../ui-components/generic/toast-box/toast.service";
import { FormInputComponent } from "../../../ui-components/generic/form-input/form-input.component";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoDirective,
    FormInputComponent,
  ],
  template: `
    <ng-container *transloco="let t">
      <form
        [formGroup]="loginForm"
        (ngSubmit)="onLoginFormSubmit()"
        class="flex flex-col grow max-w-72 gap-2 mt-4 mx-8"
      >
        <app-form-input
          iconName="person"
          [label]="t('auth.username')"
          [formGroup]="loginForm"
          formControlName="username"
        ></app-form-input>
        <app-form-input
          iconName="key"
          [label]="t('auth.password')"
          [formGroup]="loginForm"
          type="password"
          formControlName="password"
        ></app-form-input>
        <button
          type="submit"
          [disabled]="!loginForm.valid || isSubmitting"
          class="btn btn-primary"
        >
          <div [ngClass]="{ invisible: isSubmitting }">
            {{ t("common.submit") | titlecase }}
          </div>
          <span
            *ngIf="isSubmitting"
            class="loading loading-dots loading-md absolute"
          ></span>
        </button>
      </form>
    </ng-container>
  `,
  styles: `:host {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
  }`,
})
export class LoginComponent {
  isSubmitting = false;

  loginForm = this.formBuilder.group({
    username: ["", Validators.required],
    password: ["", Validators.required],
  });

  private defaultRedirectAfterLogin = "/cabins-map";

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}

  onLoginFormSubmit = () => {
    const { username, password } = this.loginForm.value;
    if (!username || !password) {
      console.error("Invalid username or password");
      return;
    }

    this.isSubmitting = true;
    this.authService
      .login(username, password)
      .pipe(
        tap((res) => {
          if (res.body?.status === "success") {
            this.toastService.createToast("Login successful!", "success");
            const returnUrl =
              this.route.snapshot.queryParams["returnUrl"] ||
              this.defaultRedirectAfterLogin;
            this.router.navigateByUrl(returnUrl);
          }
        }),
        catchError((e: any) => {
          this.toastService.createToast("Login failed!", "error");
          throw e;
        }),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe();
  };
}
