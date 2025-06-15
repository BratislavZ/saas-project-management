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

router.delete(
  "/api/organization/:organizationId/project/:projectId/column/:columnId",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: ["TICKET_COLUMN_DELETE"],
  }),
  deleteTicketColumnHandler
);

const DeleteTicketColumnSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      projectId: z.coerce.number().int().positive(),
      columnId: z.coerce.number().int().positive(),
    })
    .superRefine(async ({ organizationId, projectId, columnId }, ctx) => {
      const [
        isProjectInOrganization,
        isProjectActive,
        isColumnInProject,
        columnHasTickets,
      ] = await Promise.all([
        projectValidationService.isProjectInOrganization(
          organizationId,
          projectId
        ),
        projectValidationService.isProjectActive(projectId),
        projectValidationService.isColumnInProject(projectId, columnId),
        projectValidationService.doesColumnHaveTickets(columnId),
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
      if (columnHasTickets) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cannot delete column with tickets",
        });
      }
    }),
});

async function deleteTicketColumnHandler(req: Request, res: Response) {
  const safeData = await validateRequest(DeleteTicketColumnSchema, req);
  const { columnId, projectId } = safeData.params;

  await prisma.ticketColumn.delete({
    where: {
      id: columnId,
      projectId,
    },
  });

  res.status(StatusCodes.NO_CONTENT).send();
}

export { router as deleteTicketColumnRoute };
