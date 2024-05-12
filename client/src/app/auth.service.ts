import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { ResponseObservableInterface } from "./types/response.type";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(private apiService: ApiService) {}

  login = (
    username: string,
    password: string
  ): ResponseObservableInterface<
    { user: { username: string } },
    { username: string; password: string }
  > => this.apiService.post("/auth/login", { username, password });

  logout = (): ResponseObservableInterface<null> =>
    this.apiService.post("/auth/logout");

  signUp = (
    username: string,
    password: string
  ): ResponseObservableInterface<
    { user: { id: number } },
    { username: string; password: string }
  > => this.apiService.post("/auth/sign-up", { username, password });

  checkAuth = (): ResponseObservableInterface<{ userAuthenticated: boolean }> =>
    this.apiService.post("/auth/check-login");
}
