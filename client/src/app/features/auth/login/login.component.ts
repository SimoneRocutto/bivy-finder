import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../auth.service";
import { TranslocoDirective } from "@jsverse/transloco";
import { tap } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
      <div class="bg-red-400">{{ t("auth.login") | titlecase }}</div>
      <form
        [formGroup]="loginForm"
        (ngSubmit)="onLoginFormSubmit()"
        class="flex flex-col gap-2"
      >
        <label for="username">{{ t("auth.username") | titlecase }}</label>
        <input
          id="username"
          formControlName="username"
          type="text"
          class="bg-gray-200"
        />
        <label for="password">{{ t("auth.password") | titlecase }}</label>
        <input
          id="password"
          formControlName="password"
          type="password"
          class="bg-gray-200"
        />
        <button
          type="submit"
          [disabled]="!loginForm.valid"
          class="disabled:text-gray-500 disabled:bg-gray-200"
        >
          {{ t("common.submit") | titlecase }}
        </button>
      </form>
    </ng-container>
  `,
  styles: ``,
})
export class LoginComponent {
  loginForm = this.formBuilder.group({
    username: ["", Validators.required],
    password: ["", Validators.required],
  });
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  onLoginFormSubmit = () => {
    const { username, password } = this.loginForm.value;
    if (!username || !password) {
      console.error("Invalid username or password");
      return;
    }
    this.authService
      .login(username, password)
      .pipe(
        tap((res) => {
          if (res.body?.status === "success") {
            this.router.navigate(["/"]);
          }
        })
      )
      .subscribe();
  };
}
