import * as express from "express";
import {
  ErrorResponseInterface,
  FailResponseInterface,
  SuccessResponseInterface,
} from "../types/response";
export const sendSuccess = (
  res: express.Response<any, Record<string, any>>,
  data: any,
  status: number = 200
) => {
  const response: SuccessResponseInterface = {
    status: "success",
    data: data,
  };
  return res.status(status).send(response);
};
export const sendFail = (
  res: express.Response<any, Record<string, any>>,
  data: any,
  status: number
) => {
  const response: FailResponseInterface = { status: "fail", data: data };
  return res.status(status).send(response);
};
export const sendError = (
  res: express.Response<any, Record<string, any>>,
  message: string,
  status: number
) => {
  const response: ErrorResponseInterface = {
    status: "error",
    message: message,
  };
  return res.status(status).send(response);
};
