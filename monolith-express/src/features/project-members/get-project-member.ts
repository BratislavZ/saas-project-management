import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { logger } from "../../shared/lib/logger";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { hasRolePermission } from "../../shared/middlewares/has-role-permission";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";
import { ProjectMemberDTO, ProjectMemberDTOSchema } from "./utils/dtos";

const router = Router();

router.get(
  "/api/organization/:organizationId/project/:projectId/member/:memberId",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: ["PROJECT_MEMBER_REMOVE", "PROJECT_MEMBER_ROLE_UPDATE"],
  }),
  getProjectMemberHandler
);

const GetProjectMemberSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      projectId: z.coerce.number().int().positive(),
      memberId: z.coerce.number().int().positive(),
    })
    .superRefine(async ({ organizationId, projectId, memberId }, ctx) => {
      const [isProjectInOrganization, isProjectActive, isProjectMember] =
        await Promise.all([
          projectValidationService.isProjectInOrganization(
            organizationId,
            projectId
          ),
          projectValidationService.isProjectActive(projectId),
          projectValidationService.isProjectMember(
            organizationId,
            projectId,
            memberId
          ),
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
      if (!isProjectMember) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Member is not part of the project",
        });
      }
    }),
});

async function getProjectMemberHandler(
  req: Request,
  res: Response<ProjectMemberDTO>
) {
  const safeData = await validateRequest(GetProjectMemberSchema, req);
  const { organizationId, projectId, memberId } = safeData.params;

  const result = await prisma.projectMember.findUnique({
    where: {
      id: memberId,
      projectId,
      organizationId,
    },
    select: {
      id: true,
      createdAt: true,
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!result) {
    throw new NotFoundError("Member");
  }

  const validationSchema = ProjectMemberDTOSchema;
  const parsed = validationSchema.safeParse(result);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getProjectMemberRoute };
