import { Prisma, TicketPriority } from "@prisma/client";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { logger } from "../../shared/lib/logger";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { FilterParamsSchema } from "../../shared/utils/pagination"; // Assuming this contains searchTerm
import { validateRequest } from "../../shared/validation/validate-request";
import {
  TicketColumnDTO,
  TicketColumnDTOSchema,
} from "./utils/DTOs/TicketColumnDTO"; // Assuming this DTO is appropriate

const router = Router();

router.get(
  "/api/organization/:organizationId/project/:projectId/columns",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  getTicketColumnsHandler
);

// Updated schema to include searchTerm
const GetTicketColumnsSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      projectId: z.coerce.number().int().positive(),
    })
    .superRefine(async ({ organizationId, projectId }, ctx) => {
      const [isProjectInOrganization] = await Promise.all([
        projectValidationService.isProjectInOrganization(
          organizationId,
          projectId
        ),
      ]);

      if (!isProjectInOrganization) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Project does not exist in the organization",
        });
      }
    }),
  query: z.object({
    searchTerm: FilterParamsSchema.shape.searchTerm,
    assigneeId: z.coerce.number().int().positive().optional(),
    priority: z
      .nativeEnum(TicketPriority, { message: "Invalid enum value" })
      .optional(),
  }),
});

async function getTicketColumnsHandler(
  req: Request,
  res: Response<Array<TicketColumnDTO>>
) {
  const safeData = await validateRequest(GetTicketColumnsSchema, req);
  const { projectId } = safeData.params;
  const { searchTerm, assigneeId, priority } = safeData.query;

  // Construct the where clause for tickets based on searchTerm
  const ticketWhereClause: Prisma.TicketWhereInput = {};
  if (searchTerm) {
    ticketWhereClause.title = {
      contains: searchTerm,
      mode: "insensitive", // Case-insensitive search
    };
  }

  // Add assignee filter
  if (assigneeId) {
    ticketWhereClause.assigneeId = assigneeId;
  }

  // Add priority filter
  if (priority) {
    ticketWhereClause.priority = priority;
  }

  const result = await prisma.ticketColumn.findMany({
    where: {
      projectId,
    },
    select: {
      id: true,
      name: true,
      position: true,
      projectId: true,
      tickets: {
        where: ticketWhereClause, // Apply the filter to tickets
        select: {
          id: true,
          title: true,
          priority: true,
          type: true,
          dueDate: true,
          position: true,
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
    orderBy: {
      position: "asc",
    },
  });

  const validationSchema = TicketColumnDTOSchema.array();
  const parsed = validationSchema.safeParse(result);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(result);
}

export { router as getTicketColumnsRoute };
