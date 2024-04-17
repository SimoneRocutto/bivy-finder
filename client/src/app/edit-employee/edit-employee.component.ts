import { Component, OnInit, WritableSignal } from "@angular/core";
import { EmployeeFormComponent } from "../employee-form/employee-form.component";
import { ActivatedRoute, Router } from "@angular/router";
import { Employee } from "../employee";
import { EmployeeService } from "../employee.service";

@Component({
  selector: "app-edit-employee",
  standalone: true,
  imports: [EmployeeFormComponent],
  template: `
    <div class="card">
      <div class="card-header">
        <h3>Add New Employee</h3>
      </div>
      <div class="card-content">
        <app-employee-form
          [initialState]="employee()"
          (formSubmitted)="editEmployee($event)"
        ></app-employee-form>
      </div>
    </div>
  `,
  styles: ``,
})
export class EditEmployeeComponent implements OnInit {
  employee = {} as WritableSignal<Employee>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) {
      alert("No id provided");
    }

    this.employeeService.getEmployee(id!);
    this.employee = this.employeeService.employee$;
  }

  editEmployee(employee: Employee) {
    this.employeeService
      .updateEmployee(this.employee()._id || "", employee)
      .subscribe({
        next: () => {
          this.router.navigate(["/"]);
        },
        error: (error) => {
          alert("Failed to update employee");
          console.error(error);
        },
      });
  }
}
