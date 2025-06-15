import { Router } from "express";
import { createOrganizationRoute } from "./create-organization";
import { updateOrganizationRoute } from "./update-organization";
import { getAllOrganizationsRoute } from "./get-all-organizations";
import { getPaginatedOrganizationsRoute } from "./get-paginated-organizations";
import { getOrganizationRoute } from "./get-organization";
import { banOrganizationRoute } from "./ban-organization";
import { activateOrganizationRoute } from "./activate-organization";

const router = Router();

router.use(createOrganizationRoute);

router.use(updateOrganizationRoute);

router.use(getAllOrganizationsRoute);

router.use(getPaginatedOrganizationsRoute);

router.use(getOrganizationRoute);

router.use(banOrganizationRoute);

router.use(activateOrganizationRoute);

export { router as organizationRoutes };
