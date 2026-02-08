import { Router } from "express";
import { SpecialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRouter } from "../module/auth/auth.route";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/specialites", SpecialtyRoutes)


export const IndexRoutes = router;