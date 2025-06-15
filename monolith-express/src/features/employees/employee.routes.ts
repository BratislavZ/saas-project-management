import { Router } from "express";
import { createEmployeeRoute } from "./create-employee";
import { updateEmployeeRoute } from "./update-employee";
import { banEmployeeRoute } from "./ban-employee";
import { getPaginatedUsersRoute } from "./get-paginated-employees";
import { activateEmployeeRoute } from "./activate-employee";
import { getEmployeeRoute } from "./get-employee";
import { getAllEmployeesRoute } from "./get-all-employees";

const router = Router();

router.use(createEmployeeRoute);
router.use(updateEmployeeRoute);
router.use(banEmployeeRoute);
router.use(activateEmployeeRoute);
router.use(getPaginatedUsersRoute);
router.use(getEmployeeRoute);
router.use(getAllEmployeesRoute);

export { router as userRoutes };
