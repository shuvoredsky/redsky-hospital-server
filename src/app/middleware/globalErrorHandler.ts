import e, { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import { error } from "node:console";
import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSource } from "../interface/error.interface";
import { handleZodError } from "../errorHelpers/handleZodError";
import AppError from "../errorHelpers/AppError";




export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if(envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err)
  }

  let errorSource: TErrorSource[] = []
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";
  let stack: string | undefined = undefined

  /**
   *  error.issues; 
    /* [
      {
        expected: 'string',
        code: 'invalid_type',
        path: [ 'username' ],
        message: 'Invalid input: expected string'
      },
      {
        expected: 'number',
        code: 'invalid_type',
        path: [ 'xp' ],
        message: 'Invalid input: expected number'
      }
    ] *
   * 
   */

  if(err instanceof z.ZodError) {
    const simplefiedError = handleZodError(err);
    statusCode = simplefiedError.statusCode as number;
    message = simplefiedError.message;
    errorSource.push(...simplefiedError.errorSource);
  
    }else if(err instanceof AppError) {
      statusCode = err.statusCode;
      message = err.message;
      stack = err.stack;
      errorSource=[{
        path: '',
        message: err.message
      }]

    }

  const errorResponse: TErrorResponse = {
    success: false,
    message: message,
    errorSource,
    stack: envVars.NODE_ENV==="development"?stack:undefined,
    error:envVars.NODE_ENV==="development"?err:undefined
    
  }

  res.status(statusCode).json(errorResponse);
}