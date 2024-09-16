import { CabinsMapComponent } from "./features/cabins-map/cabins-map.component";
import { Routes } from "@angular/router";
import { LoginComponent } from "./features/auth/login/login.component";
import { UserSignUpComponent } from "./features/auth/user-sign-up/user-sign-up.component";
import { AdminDashboardComponent } from "./features/admin-dashboard/admin-dashboard.component";
import { roleGuard } from "./guards/role.guard";
import { NotFoundComponent } from "./features/not-found/not-found.component";

export const routes: Routes = [
  { path: "", redirectTo: "cabins-map", pathMatch: "full" },
  { path: "cabins-map", component: CabinsMapComponent },
  { path: "cabins-map/:id", component: CabinsMapComponent },
  {
    path: "admin-dashboard",
    canActivate: [roleGuard],
    data: { role: "admin" },
    component: AdminDashboardComponent,
  },
  { path: "login", component: LoginComponent },
  { path: "sign-up", component: UserSignUpComponent },
  { path: "**", component: NotFoundComponent },
];
