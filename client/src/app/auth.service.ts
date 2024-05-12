import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(private apiService: ApiService) {}

  login = (username: string, password: string) =>
    this.apiService.post("/auth/login", { username, password });

  logout = () => this.apiService.post("/auth/logout");

  signUp = (username: string, password: string) =>
    this.apiService.post("/auth/sign-up", { username, password });

  checkAuth = () => this.apiService.post("/auth/check-login");
}
