import { Router } from "express";
import { getMeRoute } from "./get-me";

const router = Router();

router.use(getMeRoute);

export { router as utilsRoutes };
