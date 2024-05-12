import { Observable } from "rxjs";

interface SuccessResponseInterface<T> {
  status: "success";
  data: T;
}

interface FailResponseInterface<T> {
  status: "fail";
  data: T;
}
interface ErrorResponseInterface {
  status: "error";
  message: string;
}
export type ResponseType<SuccessType = any, FailType = any> =
  | SuccessResponseInterface<SuccessType>
  | FailResponseInterface<FailType>
  | ErrorResponseInterface;

export interface ResponseObservableInterface<SuccessType = any, FailType = any>
  extends Observable<ResponseType<SuccessType, FailType>> {}
