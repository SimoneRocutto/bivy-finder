import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { environment } from "../environments/environment";
import { Observable, take } from "rxjs";
import { ResponseType } from "./types/response.type";

interface ExtraOptions {
  responseType?: any;
}

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private http: HttpClient) {}

  post = <SuccessType, FailType = any>(
    route: string,
    params: any = {},
    extraOptions?: ExtraOptions
  ): Observable<HttpResponse<ResponseType<SuccessType, FailType>>> =>
    this.http
      .post<ResponseType<SuccessType, FailType>>(
        environment.apiUrl + route,
        params,
        {
          withCredentials: true,
          observe: "response",
          ...extraOptions,
        }
      )
      .pipe(take(1));

  get = <SuccessType, FailType = any>(
    route: string,
    extraOptions?: ExtraOptions
  ): Observable<HttpResponse<ResponseType<SuccessType, FailType>>> =>
    this.http
      .get<ResponseType<SuccessType, FailType>>(environment.apiUrl + route, {
        withCredentials: true,
        observe: "response",
        ...extraOptions,
      })
      .pipe(take(1));

  put = <SuccessType, FailType = any>(
    route: string,
    params: any = {},
    extraOptions?: ExtraOptions
  ): Observable<HttpResponse<ResponseType<SuccessType, FailType>>> =>
    this.http
      .put<ResponseType<SuccessType, FailType>>(
        environment.apiUrl + route,
        params,
        {
          withCredentials: true,
          observe: "response",
          ...extraOptions,
        }
      )
      .pipe(take(1));

  delete = <SuccessType, FailType = any>(
    route: string,
    extraOptions?: ExtraOptions
  ): Observable<HttpResponse<ResponseType<SuccessType, FailType>>> =>
    this.http
      .delete<ResponseType<SuccessType, FailType>>(environment.apiUrl + route, {
        withCredentials: true,
        observe: "response",
        ...extraOptions,
      })
      .pipe(take(1));

  // This is here just to avoid errors in the employee page.
  // Since employee page is there only as an example, this
  // will be deleted in the future.
  oldGet = <T>(route: string, extraOptions?: ExtraOptions): Observable<T> =>
    this.http
      .get<T>(environment.apiUrl + route, {
        withCredentials: true,
        ...extraOptions,
      })
      .pipe(take(1));
}
