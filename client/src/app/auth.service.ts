import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { tap } from "rxjs";
import { AuthUser } from "./types/user.type";
import { ToastService } from "./ui-components/generic/toast-box/toast.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  get userIsLogged() {
    return !!this.loggedUser?.id;
  }

  loggedUser: AuthUser = {
    id: null,
    username: null,
    role: null,
  };

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {
    this.checkAuth().subscribe((res) => {
      if (res.body?.status === "success") {
        if (res.body.data.userAuthenticated) {
          const { id, username, role } = res.body.data.user;
          this.setUser(id, username, role);
        }
      } else {
        // Todo improve error handling
        console.error("Unknown error while authenticating.");
      }
    });
  }

  login = (username: string, password: string) =>
    this.apiService
      .post<{ user: AuthUser }, { username: string; password: string }>(
        "/auth/login",
        { username, password }
      )
      .pipe(
        tap((res) => {
          if (res.body?.status === "success") {
            this.setUser(
              res.body.data.user.id,
              res.body.data.user.username,
              res.body.data.user.role
            );
          } else {
            console.error("Unknown error while authenticating.");
          }
        })
      );

  logout = () =>
    this.apiService.post<null>("/auth/logout").pipe(
      tap((res) => {
        if (res.body?.status === "success") {
          this.clearUser();
          this.toastService.createToast("Logout successful!", "success");
        } else {
          console.error("Unknown error while logging out.");
        }
      })
    );

  signUp = (username: string, password: string) =>
    this.apiService.post<
      { user: { id: number } },
      { username: string; password: string }
    >("/auth/sign-up", { username, password });

  checkAuth = () =>
    this.apiService.post<{
      userAuthenticated: boolean;
      user: AuthUser;
    }>("/auth/check-login");

  private clearUser = () => {
    this.loggedUser = { id: null, username: null, role: null };
  };

  private setUser = (
    id: string | null,
    username: string | null,
    role: string | null
  ) => {
    const invalidValue = [id, username].some(
      (item) => typeof item !== "string" || item === ""
    );
    if (invalidValue) {
      console.error("User data is invalid");
      return;
    }

    this.loggedUser = { id, username, role };
  };
}
