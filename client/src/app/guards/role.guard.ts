import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth.service";
import { authGuard } from "./auth.guard";
import { ToastService } from "../ui-components/generic/toast-box/toast.service";

export const roleGuard: CanActivateFn = (route, state) => {
  // First we make sure the user is logged in. If not, he will be
  // redirected to the login page.
  if (!authGuard(route, state)) {
    return false;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  let role: string = route.data?.role;
  if (role && authService.loggedUser.role === role) {
    return true;
  }

  const toastService = inject(ToastService);
  toastService.createToast("Unauthorized", "error");

  router.navigate(["/"]);
  return false;
};
