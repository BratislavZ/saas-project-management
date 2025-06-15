import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { ticketValidationService } from "../../shared/services/ticket-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";
import { TicketDTO } from "./utils/DTOs/TicketDTO";

const router = Router();

router.get(
  "/api/organization/:organizationId/project/:projectId/ticket/:ticketId",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  getTicketHandler
);

const GetTicketSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      projectId: z.coerce.number().int().positive(),
      ticketId: z.coerce.number().int().positive(),
    })
    .superRefine(async ({ organizationId, projectId, ticketId }, ctx) => {
      const [isProjectInOrganization, isProjectActive, isTicketInProject] =
        await Promise.all([
          projectValidationService.isProjectInOrganization(
            organizationId,
            projectId
          ),
          projectValidationService.isProjectActive(projectId),
          ticketValidationService.isTicketInProject(projectId, ticketId),
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
      if (!isTicketInProject) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ticket does not exist in the project",
        });
      }
    }),
});

async function getTicketHandler(req: Request, res: Response<TicketDTO>) {
  const safeData = await validateRequest(GetTicketSchema, req);
  const { projectId, ticketId } = safeData.params;

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
      projectId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      priority: true,
      type: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
      ticketColumn: {
        select: {
          id: true,
          name: true,
        },
      },
      position: true,
      assigneeId: true,
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          organizationId: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new NotFoundError("Ticket");
  }

  res.status(StatusCodes.OK).json(ticket);
}

export { router as getTicketRoute };
