import { Router } from "express";
import { createRoleRoute } from "./create-role";
import { updateRoleRoute } from "./update-role";
import { deleteRoleRoute } from "./delete-role";
import { getPaginatedRolesRoute } from "./get-paginated-roles";
import { getRoleRoute } from "./get-role";
import { getAllRolesRoute } from "./get-all-roles";
import { getPaginatedRoleMembersRoute } from "./get-paginated-role-members";
import { getAllSelfRolesRoute } from "./get-all-self-roles";
import { getAllProjectRolesRoute } from "./get-all-project-roles";

const router = Router();

router.use(createRoleRoute);
router.use(updateRoleRoute);
router.use(deleteRoleRoute);
router.use(getPaginatedRolesRoute);
router.use(getRoleRoute);
router.use(getAllRolesRoute);
router.use(getPaginatedRoleMembersRoute);
router.use(getAllSelfRolesRoute);
router.use(getAllProjectRolesRoute);

export { router as roleRoutes };
