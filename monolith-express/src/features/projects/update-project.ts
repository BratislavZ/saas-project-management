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
  "/api/organization/:organizationId/project/:projectId",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: ["PROJECT_UPDATE"],
  }),
  updateProjectHandler
);

const UpdateProjectSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      projectId: z.coerce.number().int().positive(),
    })
    .superRefine(async ({ organizationId, projectId }, ctx) => {
      const [isProjectInOrganization, isProjectActive] = await Promise.all([
        projectValidationService.isProjectInOrganization(
          organizationId,
          projectId
        ),
        projectValidationService.isProjectActive(projectId),
      ]);

      if (!isProjectInOrganization) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Project does not exist in the organization",
        });
      }
      if (!isProjectActive) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Project is not active",
        });
      }
    }),
  body: z.object({
    name: z.string().min(1).max(32),
    description: z.string().max(256).optional(),
  }),
});

async function updateProjectHandler(req: Request, res: Response) {
  const safeData = await validateRequest(UpdateProjectSchema, req);

  const { organizationId, projectId } = safeData.params;
  const { name, description } = safeData.body;

  const project = await prisma.project.update({
    where: {
      id: projectId,
      organizationId,
    },
    data: {
      name,
      description,
    },
    select: {
      id: true,
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Project updated",
    projectId: project.id,
  });
}

export { router as updateProjectRoute };
