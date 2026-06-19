import { NextFunction, Request, Response } from 'express';
import { AppError } from '.';

export const errorMiddleware = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (error instanceof AppError) {
    console.log(`Error ${request.method} ${request.url} - ${error.message}`);

    return response.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      ...(error.details && { details: error.details }),
    });
  }

  console.log('Unhandled error: ', error);

  return response.status(500).json({
    error: {
      status: 'error',
      message: 'Internal server error',
    },
  });
};
