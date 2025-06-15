import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";

const router = Router();

router.get(
  "/api/organization/:organizationId/project/:projectId/members",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  getAllProjectMembersHandler
);

const GetAllProjectMembersSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      projectId: z.coerce.number().int().positive(),
    })
    .superRefine(async ({ organizationId, projectId }, ctx) => {
      const [isProjectInOrganization] = await Promise.all([
        projectValidationService.isProjectInOrganization(
          organizationId,
          projectId
        ),
      ]);
      if (!isProjectInOrganization) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Project does not exist in the organization",
        });
      }
    }),
});

async function getAllProjectMembersHandler(req: Request, res: Response) {
  const safeData = await validateRequest(GetAllProjectMembersSchema, req);
  const { organizationId, projectId } = safeData.params;

  const members = await prisma.projectMember.findMany({
    where: {
      projectId,
      organizationId,
      employee: {
        user: {
          status: "ACTIVE",
        },
      },
    },
    select: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const employees = members.map((member) => member.employee);

  res.status(StatusCodes.OK).json(employees);
}

export { router as getAllProjectMembersRoute };
