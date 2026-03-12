import type { Response } from "express";
import type { ApiError, ApiSuccess } from "../types";

export function success<T>(res: Response, data: T, status = 200): Response {
  const payload: ApiSuccess<T> = { success: true, data };
  return res.status(status).json(payload);
}

export function error(
  res: Response,
  code: string,
  message: string,
  status = 400
): Response {
  const payload: ApiError = {
    success: false,
    error: { code, message },
  };
  return res.status(status).json(payload);
}
