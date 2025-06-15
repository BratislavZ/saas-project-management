import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { hasRolePermission } from "../../shared/middlewares/has-role-permission";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { employeeValidationService } from "../../shared/services/employee-validation.service";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { roleValidationService } from "../../shared/services/role-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";

const router = Router();

router.post(
  "/api/organization/:organizationId/project/:projectId/member",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({ allowedPermissions: ["PROJECT_MEMBER_ADD"] }),
  addMemberHandler
);

const AddProjectMemberSchema = z
  .object({
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
      employeeId: z.coerce.number().int().positive(),
      roleId: z.coerce.number().int().positive(),
    }),
  })
  .superRefine(async ({ params, body }, ctx) => {
    const { organizationId, projectId } = params;
    const { employeeId, roleId } = body;

    const [isEmployeeInProject, isEmployeeActive, isRoleInOrganization] =
      await Promise.all([
        employeeValidationService.isEmployeeInProject(projectId, employeeId),
        employeeValidationService.isEmployeeActive(employeeId),
        roleValidationService.isRoleInOrganization(organizationId, roleId),
      ]);

    if (isEmployeeInProject) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employee is already a member of that project",
      });
    }
    if (!isEmployeeActive) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employee is not active",
      });
    }
    if (!isRoleInOrganization) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Role does not exist in the organization",
      });
    }
  });

async function addMemberHandler(req: Request, res: Response) {
  const safeData = await validateRequest(AddProjectMemberSchema, req);
  const { organizationId, projectId } = safeData.params;
  const { employeeId, roleId } = safeData.body;

  const newMember = await prisma.projectMember.create({
    data: {
      employeeId,
      projectId,
      roleId,
      organizationId,
    },
    select: {
      id: true,
      project: {
        select: {
          name: true,
        },
      },
      employee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(StatusCodes.CREATED).json({
    message: `${newMember.employee.name} added to the project ${newMember.project.name}`,
    employeeId: newMember.employee.id,
  });
}

export { router as addProjectMemberRoute };
