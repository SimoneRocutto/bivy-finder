import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ApiService } from "../../api.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-red-400">Login</div>
    <form
      [formGroup]="loginForm"
      (ngSubmit)="onLoginFormSubmit()"
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
        [disabled]="!loginForm.valid"
        class="disabled:text-gray-500 disabled:bg-gray-200"
      >
        Submit
      </button>
    </form>
    <button (click)="logout()" class="bg-red-300">Logout</button>
    <button (click)="checkAuth()" class="bg-green-300">CheckAuth</button>
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
    private apiService: ApiService
  ) {}

  onLoginFormSubmit = () => {
    const { username, password } = this.loginForm.value;
    if (!username || !password) {
      console.error("Invalid username or password");
      return;
    }
    this.apiService.post("/auth/login", { username, password }).subscribe();
  };

  logout = () => {
    this.apiService.post("/auth/logout").subscribe();
  };
  checkAuth = () => {
    this.apiService.post("/auth/check-login").subscribe();
  };
}
