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

  createBivouac = (bivouac: NewBivouac, imageFile?: File) => {
    const formData = new FormData();
    if (imageFile) {
      formData.append("bivouacImage", imageFile);
    }
    formData.append("bivouac", JSON.stringify(bivouac));
    return this.apiService.post<{ id: string }>("/bivouacs", formData);
  };

  updateBivouac = (id: string, bivouac: NewBivouac, imageFile?: File) => {
    const formData = new FormData();
    if (imageFile) {
      formData.append("bivouacImage", imageFile);
    }
    formData.append("bivouac", JSON.stringify(bivouac));
    return this.apiService.put(`/bivouacs/${id}`, formData);
  };

  deleteBivouac = (id: string) => this.apiService.delete(`/bivouacs/${id}`);

  favoriteBivouac = (id: string) =>
    this.apiService.post(`/bivouacs/favorite/${id}`);

  unfavoriteBivouac = (id: string) =>
    this.apiService.delete(`/bivouacs/favorite/${id}`);
}
