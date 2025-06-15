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

router.put(
  "/api/organization/:organizationId/project/:projectId/columns/reorder",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: ["TICKET_COLUMN_REORDER"],
  }),
  reorderTicketColumnsHandler
);

const ReorderTicketColumnsSchema = z
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
      ticketColumns: z.array(
        z.object({
          id: z.number().int().positive(),
          position: z.number().int().nonnegative(),
        })
      ),
    }),
  })
  .superRefine(async ({ params, body }, ctx) => {
    const { projectId } = params;
    const { ticketColumns } = body;

    // Verify all columns belong to this project
    const columnIds = ticketColumns.map((col) => col.id);
    const columnsInProject = await prisma.ticketColumn.count({
      where: {
        id: { in: columnIds },
        projectId,
      },
    });

    if (columnsInProject !== columnIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Some columns do not belong to this project",
      });
    }

    // Check for duplicate positions
    const positions = ticketColumns.map((col) => col.position);
    if (new Set(positions).size !== positions.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Column positions must be unique",
      });
    }
  });

async function reorderTicketColumnsHandler(req: Request, res: Response) {
  const safeData = await validateRequest(ReorderTicketColumnsSchema, req);
  const { projectId } = safeData.params;
  const { ticketColumns } = safeData.body;

  // Use transaction to ensure all updates succeed or fail together
  await prisma.$transaction(async (prisma) => {
    const updatePromises = ticketColumns.map((column) =>
      prisma.ticketColumn.update({
        where: { id: column.id, projectId },
        data: { position: column.position },
      })
    );

    await Promise.all(updatePromises);
  });

  res.status(StatusCodes.OK).json({
    message: "Columns reordered successfully",
  });
}

export { router as reorderTicketColumnsRoute };
