import { UserData } from "../types/user.type";
import { ApiService } from "./../api.service";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getUserData = () => this.apiService.get<UserData>("/users/self");
}
