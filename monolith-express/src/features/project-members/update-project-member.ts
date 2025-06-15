import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { hasRolePermission } from "../../shared/middlewares/has-role-permission";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { roleValidationService } from "../../shared/services/role-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";

const router = Router();

router.patch(
  "/api/organization/:organizationId/project/:projectId/member/:memberId",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: ["PROJECT_MEMBER_ROLE_UPDATE"],
  }),
  updateProjectMemberHandler
);

const UpdateProjectMemberSchema = z
  .object({
    params: z.object({
      organizationId: commonValidators.organizationId,
      projectId: z.coerce.number().int().positive(),
      memberId: z.coerce.number().int().positive(),
    }),
    body: z.object({
      roleId: z.number().int().positive(),
    }),
  })
  .superRefine(async ({ params, body }, ctx) => {
    const { organizationId, projectId, memberId } = params;
    const { roleId } = body;

    const [isProjectInOrg, isProjectMember, isRoleInOrg, isProjectActive] =
      await Promise.all([
        projectValidationService.isProjectInOrganization(
          organizationId,
          projectId
        ),
        projectValidationService.isProjectMember(
          organizationId,
          projectId,
          memberId
        ),
        roleValidationService.isRoleInOrganization(organizationId, roleId),
        projectValidationService.isProjectActive(projectId),
      ]);

    if (!isProjectInOrg) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project does not exist",
        path: ["params", "projectId"],
      });
    }

    if (!isProjectMember) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employee is not a member of this project",
        path: ["params", "employeeId"],
      });
    }

    if (!isRoleInOrg) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Role does not exist in this organization",
      });
    }

    if (!isProjectActive) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project is not active",
      });
    }
  });

async function updateProjectMemberHandler(req: Request, res: Response) {
  const safeData = await validateRequest(UpdateProjectMemberSchema, req);
  const { memberId, projectId } = safeData.params;
  const { roleId } = safeData.body;

  const updatedProjectMember = await prisma.projectMember.update({
    where: {
      id: memberId,
      projectId,
    },
    data: {
      roleId,
    },
    select: {
      id: true,
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Project member role updated successfully",
    memberId: updatedProjectMember.id,
  });
}

export { router as updateProjectMemberRoute };
