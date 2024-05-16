import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { NavbarComponent } from "./ui-components/specific/navbar/navbar.component";
import { SidebarComponent } from "./ui-components/specific/sidebar/sidebar.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, SidebarComponent],
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
      <app-sidebar>
        <app-navbar></app-navbar>
        <main>
          <router-outlet /></main
      ></app-sidebar>
    </div>
  `,
})
export class AppComponent {}
