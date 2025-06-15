import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { logger } from "../../shared/lib/logger";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { isOrganizationEmployee } from "../../shared/middlewares/is-organization-employee";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";
import { RoleDTO, RoleDTOSchema } from "./utils/dtos";

const router = Router();

router.get(
  "/api/organization/:organizationId/self/roles",
  attachAuthenticatedUser,
  isOrganizationEmployee,
  getAllSelfRolesHandler
);

const GetAllSelfRolesSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
  }),
});

async function getAllSelfRolesHandler(
  req: Request,
  res: Response<Array<Pick<RoleDTO, "id" | "name">>>
) {
  const safeData = await validateRequest(GetAllSelfRolesSchema, req);
  const { organizationId } = safeData.params;

  const { employeeId } = req.currentUser;
  if (!employeeId) {
    throw new NotFoundError("Employee");
  }

  const memberRoles = await prisma.projectMember.findMany({
    where: {
      employeeId,
      organizationId,
    },
    select: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    distinct: ["roleId"],
  });

  const roles = memberRoles.map((memberRole) => memberRole.role);

  const validationSchema = z.array(
    RoleDTOSchema.pick({ id: true, name: true })
  );
  const parsed = validationSchema.safeParse(roles);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getAllSelfRolesRoute };
