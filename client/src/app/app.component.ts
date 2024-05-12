import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { NavbarComponent } from "./ui-components/specific/navbar/navbar.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  styles: [
    `
      main {
        display: flex;
        justify-content: center;
        padding: 2rem 4rem;
      }
    `,
  ],
  template: `
    <div class="min-h-screen bg-gray-100">
      <app-navbar></app-navbar>
      <main>
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppComponent {}
