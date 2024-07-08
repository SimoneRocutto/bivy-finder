import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { ToastService } from "./ui-components/generic/toast-box/toast.service";

@Injectable({
  providedIn: "root",
})
export class ErrorService {
  constructor(private toastService: ToastService) {}

  catchNonHttpError = (error: any) => {
    if (error instanceof HttpErrorResponse) {
      return of(error);
    }
    throw error;
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
