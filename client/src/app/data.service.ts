import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Bivouac } from "./types/bivouac.type";

@Injectable({
  providedIn: "root",
})
export class DataService {
  private jsonUrl = "assets/bivouacs.json";

  constructor(private http: HttpClient) {}

  getData = (): Observable<Bivouac[]> =>
    this.http.get(this.jsonUrl) as Observable<Bivouac[]>;
}
