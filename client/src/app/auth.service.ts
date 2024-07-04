import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { tap } from "rxjs";

interface AuthUser {
  id: string | null;
  username: string | null;
}

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
  };

  constructor(private apiService: ApiService) {
    this.checkAuth().subscribe((res) => {
      if (res.body?.status === "success") {
        if (res.body.data.userAuthenticated) {
          const { id, username } = res.body.data.user;
          this.setUser(id, username);
        }
      } else {
        // Todo improve error handling
        console.error("Unknown error while authenticating.");
      }
    });
  }

  login = (username: string, password: string) =>
    this.apiService
      .post<
        { user: { id: string; username: string } },
        { username: string; password: string }
      >("/auth/login", { username, password })
      .pipe(
        tap((res) => {
          if (res.body?.status === "success") {
            this.setUser(res.body.data.user.id, res.body.data.user.username);
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
      user: { username: string | null; id: string | null };
    }>("/auth/check-login");

  private clearUser = () => {
    this.loggedUser = { id: null, username: null };
  };

  private setUser = (id: string | null, username: string | null) => {
    const invalidValue = [id, username].some(
      (item) => typeof item !== "string" || item === ""
    );
    if (invalidValue) {
      console.error("User data is invalid");
      return;
    }

    this.loggedUser = { id, username };
  };
}
