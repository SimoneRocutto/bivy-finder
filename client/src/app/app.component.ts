import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { EmployeesListComponent } from "./features/employees/employees-list/employees-list.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, EmployeesListComponent],
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
    <div>
      <span>BivyFinder</span>
    </div>
    <main>
      <router-outlet />
    </main>
  `,
})
export class AppComponent {}
