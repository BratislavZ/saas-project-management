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

router.post(
  "/api/organization/:organizationId/project/:projectId/column",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: ["TICKET_COLUMN_CREATE"],
  }),
  createTicketColumnHandler
);

const CreateTicketColumnSchema = z
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
      name: z.string().min(1).max(32),
      description: z.string().max(255).optional(),
    }),
  })
  .superRefine(async ({ params, body }, ctx) => {
    const { projectId } = params;
    const { name } = body;

    // Check if column with same name already exists in project
    const columnExists = await prisma.ticketColumn.findFirst({
      where: {
        name,
        projectId,
      },
    });

    if (columnExists) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Column with this name already exists in the project",
      });
    }
  });

async function createTicketColumnHandler(req: Request, res: Response) {
  const safeData = await validateRequest(CreateTicketColumnSchema, req);
  const { projectId } = safeData.params;
  const { name, description } = safeData.body;

  // Get current max position to set as default if not provided
  const maxPosition = await prisma.ticketColumn.aggregate({
    where: { projectId },
    _max: { position: true },
  });

  const newColumn = await prisma.ticketColumn.create({
    data: {
      name,
      description,
      position: (maxPosition._max.position ?? 0) + 1,
      projectId,
    },
    select: {
      id: true,
      name: true,
      position: true,
      project: {
        select: {
          name: true,
        },
      },
    },
  });

  res.status(StatusCodes.CREATED).json({
    message: `Column "${newColumn.name}" created in project ${newColumn.project.name}`,
    column: {
      id: newColumn.id,
      name: newColumn.name,
      position: newColumn.position,
    },
  });
}

export { router as createTicketColumnRoute };
