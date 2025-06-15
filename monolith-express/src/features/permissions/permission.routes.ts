import { Router } from "express";
import { getPermissionsRoute } from "./get-permissions";
import { updateRolePermissionsRoute } from "./update-role-permissions";

const router = Router();

router.use(getPermissionsRoute);
router.use(updateRolePermissionsRoute);

export { router as permissionRoutes };
