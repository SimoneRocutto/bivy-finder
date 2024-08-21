import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { ToastService } from "../ui-components/generic/toast-box/toast.service";
import { map } from "rxjs";

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  let role: string = route.data?.role;
  return authService.getUserIsLoggedObs().pipe(
    map((res) => {
      if (res && role && authService.loggedUser.role === role) {
        return true;
      }
      toastService.createToast("Unauthorized", "error");

      router.navigate(["/"]);
      return false;
    })
  );
};
