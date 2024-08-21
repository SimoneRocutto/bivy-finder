import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { tap } from "rxjs";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.getUserIsLoggedObs().pipe(
    tap((res) => {
      if (!res) {
        // not logged in so redirect to login page with the return url
        router.navigate(["/login"], {
          queryParams: { returnUrl: state.url },
        });
      }
    })
  );
};
