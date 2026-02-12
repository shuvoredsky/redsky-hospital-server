import z from "zod";
import { Gender } from "../../../generated/prisma/enums";


export const updateDoctorZodSchema = z.object({
    name: z.string().min(5, "Name must be at least 5 characters long").max(30, "Name must be at most 30 characters long"),
    contactNumber: z.string().min(11, "Contact number must be at least 11 characters long").max(14, "Contact number must be at most 14 characters long"),
    address: z.string().min(10, "Address must be at least 10 characters long").max(100, "Address must be at most 100 characters long"),
    experience: z.number().int("Experience must be an integer").nonnegative("Experience must be a non-negative integer"),
    appointmentFee: z.number().nonnegative("Appointment fee must be a non-negative number"),
    designation: z.string().min(5, "Designation must be at least 5 characters long").max(50, "Designation must be at most 50 characters long"),
    gender: z.enum([Gender.MALE, Gender.FEMALE], { message: "Gender must be either MALE or FEMALE" }),
}).partial();