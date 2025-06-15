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
import { TicketColumnDTO } from "./utils/DTOs/TicketColumnDTO";

const router = Router();

router.put(
  "/api/organization/:organizationId/project/:projectId/column/:columnId",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: ["TICKET_COLUMN_UPDATE"],
  }),
  updateTicketColumnHandler
);

const UpdateTicketColumnSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      projectId: z.coerce.number().int().positive(),
      columnId: z.coerce.number().int().positive(),
    })
    .superRefine(async ({ organizationId, projectId, columnId }, ctx) => {
      const [isProjectInOrganization, isProjectActive, isColumnInProject] =
        await Promise.all([
          projectValidationService.isProjectInOrganization(
            organizationId,
            projectId
          ),
          projectValidationService.isProjectActive(projectId),
          projectValidationService.isColumnInProject(projectId, columnId),
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
      if (!isColumnInProject) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Column does not exist in the project",
        });
      }
    }),
  body: z.object({
    name: z.string().min(1).max(32),
    description: z.string().max(255).optional().nullable(),
  }),
});

async function updateTicketColumnHandler(
  req: Request,
  res: Response<Omit<TicketColumnDTO, "tickets">>
) {
  const safeData = await validateRequest(UpdateTicketColumnSchema, req);
  const { columnId } = safeData.params;
  const { name, description } = safeData.body;

  const updatedColumn = await prisma.ticketColumn.update({
    where: { id: columnId },
    data: {
      name,
      description,
    },
    select: {
      id: true,
      name: true,
      description: true,
      position: true,
      projectId: true,
    },
  });

  res.status(StatusCodes.OK).json(updatedColumn);
}

export { router as updateTicketColumnRoute };
