import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "./user.controller";
import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

const createDoctorZodSchema = z.object({
    password: z.string("password is required").min(8,"Password must be at least 8 characters long").max(20,"Password must be at most 20 characters long"),
    doctor: z.object({
          name: z.string("name is required").min(5,"Name must be at least 5 characters long").max(30,"Name must be at most 30 characters long"),
    email: z.string("email is required").email("Invalid email format"),

        contactNumber: z.string("contact number is required").min(11,"Contact number must be at least 10 characters long").max(14,"Contact number must be at most 14 characters long"),
    address: z.string("address is required").min(10,"Address must be at least 10 characters long").max(100,"Address must be at most 100 characters long").optional(),
    
    registrationNumber: z.string("registration number is required"),
    experience: z.int("experience must be an integer").nonnegative("experience must be a non-negative integer").optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE],"Gender must be either Male or Female").optional(), 
    appointmentFee: z.number("appointment fee must be a number").nonnegative("appointment fee must be a non-negative number"),
    qualification: z.string("qualification is required").min(5,"Qualification must be at least 5 characters long").max(50,"Qualification must be at most 50 characters long"),
    currentWorkingPlace: z.string("current working place is required").min(5,"Current working place must be at least 5 characters long").max(50,"Current working place must be at most 50 characters long"),
    designation: z.string("designation is required").min(5,"Designation must be at least 5 characters long").max(50,"Designation must be at most 50 characters long"),

    }),

    specialities: z.array(z.string().uuid("Invalid specialty ID")).min(1, "At least one specialty is required")
})



const router = Router()

router.post("/create-doctor", (req:Request, res:Response, next:NextFunction)=>{
   
    const parsedResult = createDoctorZodSchema.safeParse(req.body);
    if(!parsedResult.success){
        next(parsedResult.error);
    }

    req.body = parsedResult.data;
    
    next()

} ,UserController.createDoctor)
// router.post("/create-admin", UserController.createAdmin)
// router.post("/create-superAdmin", UserController.createSuperAdmin)


export const UserRoute = router;