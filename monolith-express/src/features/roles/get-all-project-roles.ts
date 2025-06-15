import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { logger } from "../../shared/lib/logger";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { hasRolePermission } from "../../shared/middlewares/has-role-permission";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";
import { RoleDTO, RoleDTOSchema } from "./utils/dtos";

const router = Router();

router.get(
  "/api/organization/:organizationId/project/:projectId/roles",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: [
      "PROJECT_MEMBER_VIEW",
      "PROJECT_MEMBER_REMOVE",
      "PROJECT_MEMBER_ROLE_UPDATE",
    ],
  }),
  getAllProjectRolesHandler
);

const GetAllProjectRolesSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      projectId: z.coerce.number().int().positive(),
    })
    .refine(
      async (data) => {
        const { organizationId, projectId } = data;

        return await projectValidationService.isProjectInOrganization(
          organizationId,
          projectId
        );
      },
      { message: "Project does not exist" }
    ),
});

async function getAllProjectRolesHandler(
  req: Request,
  res: Response<Array<Pick<RoleDTO, "id" | "name">>>
) {
  const safeData = await validateRequest(GetAllProjectRolesSchema, req);
  const { organizationId, projectId } = safeData.params;

  const roles = await prisma.role.findMany({
    where: {
      organizationId,
      projectMembers: {
        some: {
          projectId,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
    distinct: ["id"], // Ensure we get unique roles
  });

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

export { router as getAllProjectRolesRoute };
