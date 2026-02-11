import { NextFunction, Request, Response } from "express";
import z from "zod";
import { ZodObject } from "zod";

export const validatedRequest = (zodSchema: ZodObject) =>{
    return (req:Request, res:Response, next:NextFunction) => {
        const parsedResult = zodSchema.safeParse(req.body);
        if(!parsedResult.success){
            next(parsedResult.error);
        }
        req.body = parsedResult.data;
        next();
    }
} 