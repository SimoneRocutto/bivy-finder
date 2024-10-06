import { CabinsMapComponent } from "./features/cabins-map/cabins-map.component";
import { Routes } from "@angular/router";
import { LoginComponent } from "./features/auth/login/login.component";
import { UserSignUpComponent } from "./features/auth/user-sign-up/user-sign-up.component";
import { NotFoundComponent } from "./features/not-found/not-found.component";
import { CabinsListComponent } from "./features/cabins-list/cabins-list.component";
import { PrivacyPolicyComponent } from "./features/privacy-policy/privacy-policy.component";

export const routes: Routes = [
  { path: "", redirectTo: "cabins-map", pathMatch: "full" },
  { path: "cabins-map", component: CabinsMapComponent },
  { path: "cabins-map/:id", component: CabinsMapComponent },
  {
    path: "cabins-list",
    component: CabinsListComponent,
  },
  { path: "login", component: LoginComponent },
  { path: "sign-up", component: UserSignUpComponent },
  { path: "privacy-policy", component: PrivacyPolicyComponent },
  { path: "**", component: NotFoundComponent },
];
