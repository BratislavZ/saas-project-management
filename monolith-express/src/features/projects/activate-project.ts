import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { hasRolePermission } from "../../shared/middlewares/has-role-permission";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";

const router = Router();

router.patch(
  "/api/organization/:organizationId/project/:projectId/activate",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: ["PROJECT_ACTIVATE"],
  }),
  activateProjectHandler
);

const ActivateUserSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      projectId: z.coerce.number().int().positive(),
    })
    .refine(
      async ({ organizationId, projectId }) => {
        return await projectValidationService.isProjectInOrganization(
          organizationId,
          projectId
        );
      },
      {
        message: "Project does not exist",
      }
    ),
});

async function activateProjectHandler(req: Request, res: Response) {
  const safeData = await validateRequest(ActivateUserSchema, req);

  const { projectId } = safeData.params;

  await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  res.sendStatus(StatusCodes.NO_CONTENT);
}

export { router as activateProjectRoute };
