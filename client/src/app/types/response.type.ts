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
