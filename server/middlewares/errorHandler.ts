import type { Request, Response, NextFunction } from "express";
import * as response from "../response";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  console.error("[errorHandler]", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return response.error(res, "INTERNAL_ERROR", message, 503);
}
