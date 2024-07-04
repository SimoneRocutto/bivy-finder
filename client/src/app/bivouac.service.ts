import { ApiService } from "./api.service";
import { Injectable } from "@angular/core";
import { Bivouac, NewBivouac } from "./types/bivouac.type";

@Injectable({
  providedIn: "root",
})
export class BivouacService {
  constructor(private apiService: ApiService) {}

  getBivouacs = () => this.apiService.get<Bivouac[]>("/bivouacs");

  getBivouacById = (id: string) =>
    this.apiService.get<Bivouac>(`/bivouacs/${id}`);

  createBivouac = (bivouac: NewBivouac) =>
    this.apiService.post<{ id: string }>("/bivouacs", bivouac);

  updateBivouac = (id: string, bivouac: NewBivouac) =>
    this.apiService.put(`/bivouacs/${id}`, bivouac);

  deleteBivouac = (id: string) => this.apiService.delete(`/bivouacs/${id}`);
}
