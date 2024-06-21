import { ApiService } from "./api.service";
import { Injectable } from "@angular/core";
import { Bivouac } from "./types/bivouac.type";

@Injectable({
  providedIn: "root",
})
export class BivouacService {
  constructor(private apiService: ApiService) {}

  getBivouacs = () => this.apiService.get<Bivouac[]>("/bivouacs");
}
