import { Injectable, signal } from "@angular/core";
import { Employee } from "./employee";
import { ApiService } from "../../api.service";

@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  employees$ = signal<Employee[]>([]);
  employee$ = signal<Employee>({} as Employee);

  constructor(private apiService: ApiService) {}

  private refreshEmployees() {
    this.apiService.oldGet<Employee[]>("/employees").subscribe((employees) => {
      this.employees$.set(employees);
    });
  }

  getEmployees() {
    this.refreshEmployees();
    return this.employees$();
  }

  getEmployee(id: string) {
    this.apiService
      .oldGet<Employee>(`/employees/${id}`)
      .subscribe((employee) => {
        this.employee$.set(employee);
        return this.employee$();
      });
  }

  createEmployee(employee: Employee) {
    return this.apiService.post("/employees", employee, {
      responseType: "text",
    });
  }

  updateEmployee(id: string, employee: Employee) {
    return this.apiService.put(`/employees/${id}`, employee, {
      responseType: "text",
    });
  }

  deleteEmployee(id: string) {
    return this.apiService.delete(`/employees/${id}`, { responseType: "text" });
  }
}
