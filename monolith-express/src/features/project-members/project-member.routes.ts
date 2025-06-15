import { Router } from "express";
import { addProjectMemberRoute } from "./add-project-member";
import { getAllProjectMembersRoute } from "./get-all-project-members";
import { getPaginatedProjectMembersRoute } from "./get-paginated-project-members";
import { getProjectMemberRoute } from "./get-project-member";
import { getSelfProjectMembershipRoute } from "./get-self-project-membership";
import { removeProjectMemberRoute } from "./remove-project-member";
import { updateProjectMemberRoute } from "./update-project-member";

const router = Router();

router.use(removeProjectMemberRoute);
router.use(addProjectMemberRoute);
router.use(getAllProjectMembersRoute);
router.use(getPaginatedProjectMembersRoute);
router.use(updateProjectMemberRoute);
router.use(getProjectMemberRoute);
router.use(getSelfProjectMembershipRoute);

export { router as projectMemberRoutes };
