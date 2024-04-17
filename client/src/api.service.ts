import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "./environments/environment";
import { Observable } from "rxjs";

interface ExtraOptions {
  responseType?: any;
}

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private http: HttpClient) {}

  post = <T>(
    route: string,
    params: any = {},
    extraOptions?: ExtraOptions
  ): Observable<T> =>
    this.http.post<T>(environment.apiUrl + route, params, {
      withCredentials: true,
      ...extraOptions,
    });

  get = <T>(route: string, extraOptions?: ExtraOptions): Observable<T> =>
    this.http.get<T>(environment.apiUrl + route, {
      withCredentials: true,
      ...extraOptions,
    });

  put = <T>(
    route: string,
    params: any = {},
    extraOptions?: ExtraOptions
  ): Observable<T> =>
    this.http.put<T>(environment.apiUrl + route, params, {
      withCredentials: true,
      ...extraOptions,
    });

  delete = <T>(route: string, extraOptions?: ExtraOptions): Observable<T> =>
    this.http.delete<T>(environment.apiUrl + route, {
      withCredentials: true,
      ...extraOptions,
    });
}
