import { NextFunction, Request, Response, Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { CookieUtils } from "../../utils/cookie";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { th } from "zod/locales";

const router = Router();


router.post("/", SpecialtyController.createSpecialty)
router.get("/", async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const accessToken = CookieUtils.getCookie(req, "accessToken");
    if(!accessToken){
        return new AppError(status.UNAUTHORIZED, "Unauthorized");
    }
    const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

    if(!verifiedToken.success){
        return new AppError(status.UNAUTHORIZED, "Unauthorized access token is invalid");
    }


    if(verifiedToken.data!.role !== "ADMIN"){
        throw new AppError(status.FORBIDDEN, "You are not authorized to access this resource");
    }


    next();

    }catch (error: any) {
        next(error);
    }
},SpecialtyController.getAllSpecialties)
router.delete("/:id", SpecialtyController.deleteSpecialty)
router.put("/:id", SpecialtyController.updateSpecialty)


export const SpecialtyRoutes = router;