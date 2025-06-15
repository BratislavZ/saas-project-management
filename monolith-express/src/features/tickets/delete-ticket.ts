import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { hasRolePermission } from "../../shared/middlewares/has-role-permission";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { ticketValidationService } from "../../shared/services/ticket-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";

const router = Router();

router.delete(
  "/api/organization/:organizationId/project/:projectId/ticket/:ticketId",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: ["TICKET_DELETE"],
  }),
  deleteTicketHandler
);

const DeleteTicketSchema = z.object({
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

async function deleteTicketHandler(req: Request, res: Response) {
  const safeData = await validateRequest(DeleteTicketSchema, req);
  const { projectId, ticketId } = safeData.params;

  // First get ticket details for the response message
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
      projectId,
    },
    select: {
      title: true,
      project: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new NotFoundError("Ticket");
  }

  await prisma.ticket.delete({
    where: {
      id: ticketId,
      projectId,
    },
  });

  res.status(StatusCodes.OK).json({
    message: `Ticket "${ticket.title}" deleted from project ${ticket.project.name}`,
    ticketId,
  });
}

export { router as deleteTicketRoute };
