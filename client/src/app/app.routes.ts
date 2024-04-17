import { Routes } from "@angular/router";
import { EmployeesListComponent } from "./employees-list/employees-list.component";
import { AddEmployeeComponent } from "./add-employee/add-employee.component"; // <-- add this line
import { EditEmployeeComponent } from "./edit-employee/edit-employee.component"; // <-- add this line
import { LoginComponent } from "./login/login.component";
import { UserSignUpComponent } from "./user-sign-up/user-sign-up.component";

export const routes: Routes = [
  { path: "", component: EmployeesListComponent, title: "Employees List" },
  { path: "new", component: AddEmployeeComponent },
  { path: "edit/:id", component: EditEmployeeComponent },
  { path: "login", component: LoginComponent },
  { path: "sign-up", component: UserSignUpComponent },
];
