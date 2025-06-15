import { Router } from "express";
import { createProjectRoute } from "./create-project";
import { updateProjectRoute } from "./update-project";
import { archiveProjectRoute } from "./archive-project";
import { getPaginatedProjectsRoute } from "./get-paginated-projects";
import { activateProjectRoute } from "./activate-project";
import { getProjectRoute } from "./get-project";
import { getAllProjectsRoute } from "./get-all-projects";
import { getPaginatedSelfProjectsRoute } from "./get-paginated-self-projects";
import { getAllSelfProjectsRoute } from "./get-all-self-projects";

const router = Router();

router.use(createProjectRoute);
router.use(updateProjectRoute);
router.use(archiveProjectRoute);
router.use(activateProjectRoute);
router.use(getPaginatedProjectsRoute);
router.use(getProjectRoute);
router.use(getAllProjectsRoute);
router.use(getPaginatedSelfProjectsRoute);
router.use(getAllSelfProjectsRoute);

export { router as projectRoutes };
