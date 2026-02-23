import { NextFunction, Request, Response, Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { CookieUtils } from "../../utils/cookie";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { th } from "zod/locales";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { check } from "zod";
import { multerUpload } from "../../config/multer.config";
import { validatedRequest } from "../../middleware/validateRequest";
import { specialityValidationSchema } from "./speciality.validation";

const router = Router();


router.post("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("file"), validatedRequest(specialityValidationSchema.createSpecialtySchema),
SpecialtyController.createSpecialty)
router.get("/", SpecialtyController.getAllSpecialties)
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialtyController.deleteSpecialty)
router.put("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialtyController.updateSpecialty)    


export const SpecialtyRoutes = router;