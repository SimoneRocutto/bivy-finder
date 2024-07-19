import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth.service";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.userIsLogged) {
    return true;
  }

  // not logged in so redirect to login page with the return url
  router.navigate(["/login"], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
