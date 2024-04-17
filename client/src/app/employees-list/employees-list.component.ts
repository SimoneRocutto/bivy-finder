import { Component, OnInit, WritableSignal } from "@angular/core";
import { Employee } from "../employee";
import { EmployeeService } from "../employee.service";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-employees-list",
  standalone: true,
  imports: [RouterModule, CommonModule],
  styles: [
    `
      table {
        width: 100%;

        button:first-of-type {
          margin-right: 1rem;
        }
      }

      .employee-list-container {
        font-family: Arial, sans-serif;
        width: 100%;
        margin: 20px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }

      th {
        background-color: #f2f2f2;
      }

      tr:hover {
        background-color: #f2f2f2;
      }

      button {
        cursor: pointer;
        border: none;
        outline: none;
        padding: 8px 16px;
        border-radius: 4px;
      }

      .add-employee-button {
        background-color: #007bff;
        color: white;
      }

      .delete-button {
        background-color: #dc3545;
        color: white;
      }
    `,
  ],
  template: `
    <div class="employee-list-container">
      <h2>Employees List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Level</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let employee of employees$()">
            <td>{{ employee.name }}</td>
            <td>{{ employee.position }}</td>
            <td>{{ employee.level }}</td>
            <td>
              <button [routerLink]="['edit/', employee._id]">Edit</button>
              <button
                (click)="deleteEmployee(employee._id)"
                class="delete-button"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button [routerLink]="['new']" class="mt-2 add-employee-button">
        Add a New Employee
      </button>
    </div>
  `,
})
export class EmployeesListComponent implements OnInit {
  employees$ = {} as WritableSignal<Employee[]>;
  displayedColumns: string[] = [
    "col-name",
    "col-position",
    "col-level",
    "col-action",
  ];

  constructor(private employeesService: EmployeeService) {}

  ngOnInit() {
    this.fetchEmployees();
  }

  deleteEmployee(id: string | undefined): void {
    if (!id) {
      return;
    }
    this.employeesService.deleteEmployee(id).subscribe({
      next: () => this.fetchEmployees(),
    });
  }

  private fetchEmployees(): void {
    this.employees$ = this.employeesService.employees$;
    this.employeesService.getEmployees();
  }
}
