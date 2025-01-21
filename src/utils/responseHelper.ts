// src/utils/responseHelper.ts
import { Response } from "express";

interface SuccessResponse<T> {
  status: number;
  statusText: string;
  data: T;
  headers?: any; // Optional: Add headers if needed
  config?: any; // Optional: Add additional metadata if needed
}

interface ErrorResponse {
  status: number;
  statusText: string;
  error: string;
  message?: string; // Optional: Custom error message
}

/**
 * Send a successful response
 */
export const sendSuccessResponse = <T>(
  res: Response,
  data: T,
  status: number = 200,
  statusText: string = "OK",
  headers: any = {}
): void => {
  res.status(status).json({
    status,
    statusText,
    data,
    headers,
  });
};

/**
 * Send an error response
 */
export const sendErrorResponse = (
  res: Response,
  error: string,
  status: number = 500,
  statusText: string = "Internal Server Error",
  message?: string
): void => {
  res.status(status).json({
    status,
    statusText,
    error,
    message,
  });
};
