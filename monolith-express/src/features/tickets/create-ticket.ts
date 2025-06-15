import { TicketPriority, TicketType } from "@prisma/client";
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
import { ticketValidationService } from "../../shared/services/ticket-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";

const router = Router();

router.post(
  "/api/organization/:organizationId/project/:projectId/ticket",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: ["TICKET_CREATE"],
  }),
  createTicketHandler
);

const CreateTicketSchema = z
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
      title: z.string().min(1).max(32),
      description: z.string().nullable(),
      columnId: z.number().int().positive(),
      priority: z.nativeEnum(TicketPriority).nullable(),
      type: z.nativeEnum(TicketType).optional(),
      dueDate: z.coerce.date().optional(),
      assigneeId: z.number().int().positive().optional(),
    }),
  })
  .superRefine(async ({ params, body }, ctx) => {
    const { organizationId, projectId } = params;
    const { assigneeId, columnId } = body;

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

    if (assigneeId) {
      const [isEmployeeInOrganization, isEmployeeActive] = await Promise.all([
        employeeValidationService.isEmployeeInOrganization(
          organizationId,
          assigneeId
        ),
        employeeValidationService.isEmployeeActive(assigneeId),
      ]);

      if (!isEmployeeInOrganization) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Assignee does not belong to the organization",
        });
      }
      if (!isEmployeeActive) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Assignee is not active",
        });
      }
    }
  });

async function createTicketHandler(req: Request, res: Response) {
  const currentUser = req.currentUser;

  const safeData = await validateRequest(CreateTicketSchema, req);
  const { projectId } = safeData.params;
  const { title, description, columnId, priority, type, dueDate, assigneeId } =
    safeData.body;

  const newTicket = await prisma.ticket.create({
    data: {
      title,
      description,
      priority: priority || TicketPriority.MEDIUM,
      type: type || TicketType.TASK,
      dueDate,
      projectId,
      assigneeId,
      ticketColumnId: columnId,
      creatorId: currentUser.id,
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

  res.status(StatusCodes.CREATED).json({
    message: `Ticket "${newTicket.title}" created in project ${newTicket.project.name}`,
    ticketId: newTicket.id,
  });
}

export { router as createTicketRoute };
