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
  "/api/organization/:organizationId/project/:projectId/tickets/reorder",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: ["TICKET_REORDER"],
  }),
  reorderTicketsHandler
);

const ReorderTicketsSchema = z
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
      tickets: z.array(
        z.object({
          id: z.number().int().positive(),
          position: z.number().int().nonnegative(),
          ticketColumnId: z.number().int().positive(),
        })
      ),
    }),
  })
  .superRefine(async ({ params, body }, ctx) => {
    const { projectId } = params;
    const { tickets } = body;
    const ticketIds = tickets.map((t) => t.id);
    const columnIds = [...new Set(tickets.map((t) => t.ticketColumnId))];

    // Verify all tickets belong to this project
    const ticketsInProject = await prisma.ticket.count({
      where: {
        id: { in: ticketIds },
        projectId,
      },
    });

    if (ticketsInProject !== ticketIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Some tickets do not belong to this project",
      });
    }

    // Verify all columns belong to this project
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

    // Check for duplicate positions within the same column
    const columnPositionMap = new Map<number, Set<number>>();
    tickets.forEach((ticket) => {
      if (!columnPositionMap.has(ticket.ticketColumnId)) {
        columnPositionMap.set(ticket.ticketColumnId, new Set());
      }
      const positions = columnPositionMap.get(ticket.ticketColumnId)!;
      if (positions.has(ticket.position)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate position ${ticket.position} in column ${ticket.ticketColumnId}`,
          path: ["body", "tickets"],
        });
      }
      positions.add(ticket.position);
    });
  });

async function reorderTicketsHandler(req: Request, res: Response) {
  const safeData = await validateRequest(ReorderTicketsSchema, req);
  const { projectId } = safeData.params;
  const { tickets } = safeData.body;

  await prisma.$transaction(async (prisma) => {
    const updatePromises = tickets.map((ticket) =>
      prisma.ticket.update({
        where: { id: ticket.id, projectId },
        data: {
          position: ticket.position,
          ticketColumnId: ticket.ticketColumnId,
        },
      })
    );
    await Promise.all(updatePromises);
  });

  res.status(StatusCodes.OK).json({
    message: "Tickets updated successfully",
  });
}

export { router as reorderTicketsRoute };
