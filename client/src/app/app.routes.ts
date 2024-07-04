import { BivouacsMapComponent } from "./features/bivouacs-map/bivouacs-map.component";
import { Routes } from "@angular/router";
import { EmployeesListComponent } from "./features/employees/employees-list/employees-list.component";
import { AddEmployeeComponent } from "./features/employees/add-employee/add-employee.component"; // <-- add this line
import { EditEmployeeComponent } from "./features/employees/edit-employee/edit-employee.component"; // <-- add this line
import { LoginComponent } from "./features/auth/login/login.component";
import { HomeComponent } from "./features/home/home.component";
import { UserSignUpComponent } from "./features/auth/user-sign-up/user-sign-up.component";
import { AdminDashboardComponent } from "./features/admin-dashboard/admin-dashboard.component";

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "bivouacs-map", component: BivouacsMapComponent },
  { path: "admin-dashboard", component: AdminDashboardComponent },
  {
    path: "employees",
    component: EmployeesListComponent,
    title: "Employees List",
  },
  { path: "new-employee", component: AddEmployeeComponent },
  { path: "edit/:id", component: EditEmployeeComponent },
  { path: "login", component: LoginComponent },
  { path: "sign-up", component: UserSignUpComponent },
];
