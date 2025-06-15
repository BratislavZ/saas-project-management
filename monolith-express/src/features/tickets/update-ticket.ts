import { getAuth } from "@clerk/express";
import { TicketPriority, TicketType } from "@prisma/client";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { NotAuthenticatedError } from "../../shared/errors/not-authenticated-error";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { hasRolePermission } from "../../shared/middlewares/has-role-permission";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { employeeValidationService } from "../../shared/services/employee-validation.service";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { ticketValidationService } from "../../shared/services/ticket-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";

const router = Router();

router.put(
  "/api/organization/:organizationId/project/:projectId/ticket/:ticketId",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: ["TICKET_UPDATE"],
  }),
  updateTicketHandler
);

const UpdateTicketSchema = z
  .object({
    params: z
      .object({
        organizationId: commonValidators.organizationId,
        projectId: z.coerce.number().int().positive(),
        ticketId: z.coerce.number().int().positive(),
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
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      columnId: z.number().int().positive().optional(),
      priority: z.nativeEnum(TicketPriority).optional(),
      type: z.nativeEnum(TicketType).optional(),
      dueDate: z.coerce.date().optional().nullable(),
      assigneeId: z.number().int().positive().optional().nullable(),
    }),
  })
  .superRefine(async ({ params, body }, ctx) => {
    const { organizationId, projectId, ticketId } = params;
    const { assigneeId, columnId } = body;

    // Check if ticket exists and belongs to the project
    const ticketExists = await ticketValidationService.isTicketInProject(
      projectId,
      ticketId
    );
    if (!ticketExists) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ticket does not exist in the project",
      });
    }

    if (columnId) {
      // Check if the ticket column is in the project
      const isTicketColumnInProject =
        await ticketValidationService.isTicketColumnInProject(
          projectId,
          columnId
        );
      if (!isTicketColumnInProject) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ticket column does not exist in the project",
        });
      }
    }

    if (assigneeId) {
      const [isUserInOrganization, isUserActive] = await Promise.all([
        employeeValidationService.isEmployeeInOrganization(
          organizationId,
          assigneeId
        ),
        employeeValidationService.isEmployeeActive(assigneeId),
      ]);

      if (!isUserInOrganization) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Assignee does not belong to the organization",
        });
      }
      if (!isUserActive) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Assignee is not active",
        });
      }
    }
  });

async function updateTicketHandler(req: Request, res: Response) {
  const auth = getAuth(req);

  if (!auth.userId) {
    throw new NotAuthenticatedError();
  }

  const safeData = await validateRequest(UpdateTicketSchema, req);
  const { projectId, ticketId } = safeData.params;
  const { title, description, columnId, priority, type, dueDate, assigneeId } =
    safeData.body;

  const updatedTicket = await prisma.ticket.update({
    where: {
      id: ticketId,
      projectId,
    },
    data: {
      title,
      description,
      priority,
      type,
      dueDate,
      assigneeId,
      ticketColumnId: columnId,
    },
    select: {
      id: true,
      title: true,
      project: {
        select: {
          name: true,
        },
      },
    },
  });

  res.status(StatusCodes.OK).json({
    message: `Ticket "${updatedTicket.title}" updated in project ${updatedTicket.project.name}`,
    ticketId: updatedTicket.id,
  });
}

export { router as updateTicketRoute };
