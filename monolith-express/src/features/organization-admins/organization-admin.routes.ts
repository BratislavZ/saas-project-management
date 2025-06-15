import { Router } from "express";
import { createOrganizationAdminRoute } from "./create-organization-admin";
import { updateOrganizationAdminRoute } from "./update-organization-admin";
import { getOrganizationAdminRoute } from "./get-organization-admin";
import { banOrganizationAdminRoute } from "./ban-organization-admin";
import { activateOrganizationAdminRoute } from "./activate-organization-admin";
import { getPaginatedOrganizationAdminsRoute } from "./get-paginated-organization-admins";

const router = Router();

router.use(getPaginatedOrganizationAdminsRoute);

router.use(createOrganizationAdminRoute);

router.use(updateOrganizationAdminRoute);

router.use(getOrganizationAdminRoute);

router.use(banOrganizationAdminRoute);

router.use(activateOrganizationAdminRoute);

export { router as organizationAdminRoutes };
