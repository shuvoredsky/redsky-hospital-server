import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { CookieUtils } from "../utils/cookie";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";

export const checkAuth = (...authRoles: Role[]) => async(req: Request, res:Response, next: NextFunction) =>{
    try{
        const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");

        if(!sessionToken){
            throw new AppError(status.UNAUTHORIZED, "Unathorized access! No session token provided");
        }

        if(sessionToken){
            const sessionExists = await prisma.session.findFirst({
                where:{
                    token: sessionToken,
                    expiresAt: {
                        gt:new Date(),

                    }
                },
                include:{
                    user: true,
                }
            })

            if(sessionExists && sessionExists.user){
                const user = sessionExists.user;

                const now = new Date();
                const expiresAt = new Date(sessionExists.expiresAt);
                const createdAt = new Date(sessionExists.createdAt);

                const sessionLifeTime = expiresAt.getTime() - now.getTime();
                const timeRemaining = expiresAt.getTime() - createdAt.getTime();
                const percentRemaining = Math.round((timeRemaining / sessionLifeTime) * 100);

                if(percentRemaining < 20){
                    res.setHeader("X-Session-Refresh", "true");
                    res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
                    res.setHeader("X-Time-Remaining", timeRemaining.toString());


                }


            }

        }
    }catch (error: any) {
        next(error);
    }
} 