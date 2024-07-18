import { ErrorResponseInterface } from "./../../../server/src/models/application/response";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { ToastService } from "./ui-components/generic/toast-box/toast.service";

@Injectable({
  providedIn: "root",
})
export class ErrorService {
  constructor(private toastService: ToastService) {}

  catchHttpError = (error: any, createToast: boolean) => {
    console.error(error);
    if (error instanceof HttpErrorResponse) {
      return this.handleHttpError(error, createToast);
    }
    throw error;
  };

  catchAll = (error: any, createToast: boolean) => {
    console.error(error);
    if (error instanceof HttpErrorResponse) {
      return this.handleHttpError(error, createToast);
    }
    if (createToast) {
      this.toastService.createToast("Unknown server error", "error");
    }
    return of(error);
  };

  private handleHttpError = (
    error: HttpErrorResponse,
    createToast: boolean
  ) => {
    // ! Be careful! Some http errors will not be sent by the server. For example,
    // the internet disconnected error. So you cannot be sure about the response
    // complying to ErrorResponseInterface.
    const res: ErrorResponseInterface = error.error;
    if (createToast) {
      this.toastService.createToast(res.message, "error");
    }
    return of(error);
  };

  // Todo implement possibility of handling different error types (e.g. 401, 404)
  // differently.
  filterHttpError = (
    res: HttpResponse<any> | HttpErrorResponse,
    message: string = "Unknown server error"
  ): res is Exclude<typeof res, HttpErrorResponse> => {
    const isError = res instanceof HttpErrorResponse;
    if (isError) {
      this.toastService.createToast(message, "error");
    }
    return !isError;
  };
}
