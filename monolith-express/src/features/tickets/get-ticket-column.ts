import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";
import { TicketColumnDTO } from "./utils/DTOs/TicketColumnDTO";

const router = Router();

router.get(
  "/api/organization/:organizationId/project/:projectId/column/:columnId",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  getTicketColumnHandler
);

const GetTicketColumnSchema = z.object({
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
});

async function getTicketColumnHandler(
  req: Request,
  res: Response<Omit<TicketColumnDTO, "tickets">>
) {
  const safeData = await validateRequest(GetTicketColumnSchema, req);
  const { columnId } = safeData.params;

  const column = await prisma.ticketColumn.findUnique({
    where: {
      id: columnId,
    },
    select: {
      id: true,
      name: true,
      position: true,
      projectId: true,
      description: true,
    },
  });

  if (!column) {
    throw new NotFoundError("Ticket Column");
  }

  res.status(StatusCodes.OK).json(column);
}

export { router as getTicketColumnRoute };
