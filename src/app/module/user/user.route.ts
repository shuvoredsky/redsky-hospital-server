import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "./user.controller";
import z, { ZodObject } from "zod";
import { Gender } from "../../../generated/prisma/enums";
import { validatedRequest } from "../../middleware/validateRequest";
import { createDoctorZodSchema } from "./user.validation";





const router = Router()




router.post("/create-doctor", 
    
//     (req:Request, res:Response, next:NextFunction)=>{
   
//     const parsedResult = createDoctorZodSchema.safeParse(req.body);
//     if(!parsedResult.success){
//         next(parsedResult.error);
//     }

//     req.body = parsedResult.data;
    
//     next()

// } 
validatedRequest(createDoctorZodSchema)
,UserController.createDoctor)
// router.post("/create-admin", UserController.createAdmin)
// router.post("/create-superAdmin", UserController.createSuperAdmin)


export const UserRoute = router;