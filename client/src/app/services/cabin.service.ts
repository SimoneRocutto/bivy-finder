import { ApiService } from "../api.service";
import { Injectable } from "@angular/core";
import { Cabin, NewCabin } from "../types/cabin.type";

@Injectable({
  providedIn: "root",
})
export class CabinService {
  constructor(private apiService: ApiService) {}

  getCabins = () => this.apiService.get<Cabin[]>("/cabins");

  getCabinById = (id: string) => this.apiService.get<Cabin>(`/cabins/${id}`);

  createCabin = (cabin: NewCabin, imageFile?: File) => {
    const formData = new FormData();
    if (imageFile) {
      formData.append("cabinImage", imageFile);
    }
    formData.append("cabin", JSON.stringify(cabin));
    return this.apiService.post<{ id: string }>("/cabins", formData);
  };

  updateCabin = (id: string, cabin: NewCabin, imageFile?: File) => {
    const formData = new FormData();
    if (imageFile) {
      formData.append("cabinImage", imageFile);
    }
    formData.append("cabin", JSON.stringify(cabin));
    return this.apiService.put(`/cabins/${id}`, formData);
  };

  deleteCabin = (id: string) => this.apiService.delete(`/cabins/${id}`);

  favoriteCabin = (id: string) =>
    this.apiService.post(`/cabins/favorite/${id}`);

  unfavoriteCabin = (id: string) =>
    this.apiService.delete(`/cabins/favorite/${id}`);
}
