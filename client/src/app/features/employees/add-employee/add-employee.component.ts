import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Employee } from "../employee";
import { EmployeeFormComponent } from "../employee-form/employee-form.component";
import { EmployeeService } from "../employee.service";

@Component({
  selector: "app-add-employee",
  standalone: true,
  imports: [EmployeeFormComponent],
  template: `
    <div class="card">
      <div class="card-header">
        <h3>Add New Employee</h3>
      </div>
      <div class="card-content">
        <app-employee-form
          (formSubmitted)="addEmployee($event)"
        ></app-employee-form>
      </div>
    </div>
  `,
  styles: ``,
})
export class AddEmployeeComponent {
  constructor(
    private router: Router,
    private employeeService: EmployeeService
  ) {}

  addEmployee(employee: Employee) {
    this.employeeService.createEmployee(employee).subscribe({
      next: () => {
        this.router.navigate(["/"]);
      },
      error: (error) => {
        alert("Failed to create employee");
        console.error(error);
      },
    });
    this.employeeService.getEmployees();
  }
}
