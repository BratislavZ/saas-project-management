import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { hasRolePermission } from "../../shared/middlewares/has-role-permission";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";

const router = Router();

router.delete(
  "/api/organization/:organizationId/project/:projectId/member/:memberId",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: ["PROJECT_MEMBER_REMOVE"],
  }),
  removeMemberHandler
);

const RemoveProjectMemberSchema = z
  .object({
    params: z.object({
      organizationId: commonValidators.organizationId,
      projectId: z.coerce.number().int().positive(),
      memberId: z.coerce.number().int().positive(),
    }),
  })
  .superRefine(async ({ params }, ctx) => {
    const { organizationId, projectId, memberId } = params;

    const [isProjectInOrg, isProjectMember, isProjectActive] =
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

    if (!isProjectActive) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project is not active",
      });
    }
  });

async function removeMemberHandler(req: Request, res: Response) {
  const safeData = await validateRequest(RemoveProjectMemberSchema, req);
  const { memberId, projectId } = safeData.params;

  const member = await prisma.projectMember.findFirst({
    where: {
      id: memberId,
    },
    select: {
      employeeId: true,
    },
  });

  if (!member) {
    throw new NotFoundError("ProjectMember");
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.updateMany({
      where: {
        projectId,
        assigneeId: member.employeeId,
      },
      data: {
        assigneeId: null,
      },
    });

    await tx.projectMember.delete({
      where: {
        employeeId_projectId: {
          employeeId: member.employeeId,
          projectId,
        },
      },
    });
  });

  res.sendStatus(StatusCodes.NO_CONTENT);
}

export { router as removeProjectMemberRoute };
