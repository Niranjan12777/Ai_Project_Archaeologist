import type { Response } from "express";
import type { ApiResponse } from "../interfaces/api-response.js";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Request completed successfully",
  statusCode = 200
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};
