import { Prisma, TicketPriority, TicketType } from "@prisma/client";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { logger } from "../../shared/lib/logger";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { isOrganizationEmployee } from "../../shared/middlewares/is-organization-employee";
import { commonValidators } from "../../shared/utils/common-validators";
import {
  FilterParamsSchema,
  Paginated,
  paginateSchema,
  PaginationParamsSchema,
  SortDirectionSchema,
} from "../../shared/utils/pagination";
import { validateRequest } from "../../shared/validation/validate-request";
import { SelfTicketDTO, SelfTicketDTOSchema } from "./utils/DTOs/SelfTicketDTO";

const router = Router();

router.get(
  "/api/organization/:organizationId/self/tickets-paginated",
  attachAuthenticatedUser,
  isOrganizationEmployee,
  getPaginatedSelfTicketsHandler
);

const SortFieldSchema = z.enum([
  "title",
  "project",
  "ticketColumn",
  "dueDate",
  "priority",
  "type",
]);

const GetPaginatedSelfTicketsSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
  }),
  query: z.object({
    pageNumber: PaginationParamsSchema.shape.pageNumber,
    pageSize: PaginationParamsSchema.shape.pageSize,

    searchTerm: FilterParamsSchema.shape.searchTerm,

    // Sorting
    sortBy: SortFieldSchema.optional(),
    sortDirection: SortDirectionSchema,

    // Filtering
    project: z.coerce.number().int().positive().optional(),
    priority: z
      .nativeEnum(TicketPriority, { message: "Invalid enum value" })
      .optional(),
    type: z
      .nativeEnum(TicketType, { message: "Invalid enum value" })
      .optional(),
  }),
});

async function getPaginatedSelfTicketsHandler(
  req: Request,
  res: Response<Paginated<SelfTicketDTO>>
) {
  const safeData = await validateRequest(GetPaginatedSelfTicketsSchema, req);
  const {
    pageNumber,
    pageSize,
    searchTerm,
    sortBy,
    sortDirection,
    project,
    priority,
    type,
  } = safeData.query;

  const { employeeId } = req.currentUser;
  if (!employeeId) {
    throw new NotFoundError("Employee");
  }

  // Construct dynamic where clause for filtering
  const whereClause: Prisma.TicketWhereInput = {
    assigneeId: employeeId,
    project: {
      organizationId: safeData.params.organizationId,
      status: "ACTIVE", // Only active projects
    },
  };

  // Add filters if provided
  if (project) {
    whereClause.projectId = project;
  }

  if (priority) {
    whereClause.priority = priority;
  }

  if (type) {
    whereClause.type = type;
  }

  // Add search term filter for ticket title and description
  if (searchTerm) {
    whereClause.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  // Sorting logic
  let orderBy: Prisma.TicketOrderByWithRelationInput;

  if (sortBy && sortDirection) {
    switch (sortBy) {
      case "title":
        orderBy = { title: sortDirection };
        break;
      case "project":
        orderBy = { project: { name: sortDirection } };
        break;
      case "ticketColumn":
        orderBy = { ticketColumn: { name: sortDirection } };
        break;
      case "dueDate":
        orderBy = { dueDate: sortDirection };
        break;
      case "priority":
        orderBy = { priority: sortDirection };
        break;
      case "type":
        orderBy = { type: sortDirection };
        break;
      default:
        orderBy = { createdAt: "asc" };
    }
  } else {
    orderBy = { createdAt: "asc" };
  }

  const [totalCount, tickets] = await Promise.all([
    // Count tickets with the same filters
    prisma.ticket.count({ where: whereClause }),

    // Tickets with filtering, sorting, and pagination
    prisma.ticket.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        priority: true,
        type: true,
        dueDate: true,
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
      },
      orderBy,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  // Transform the data to match DTO
  const ticketDTOs: SelfTicketDTO[] = tickets.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    priority: ticket.priority,
    type: ticket.type,
    dueDate: ticket.dueDate,
    project: {
      ...ticket.project,
    },
  }));

  // Calculate pagination details
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasPreviousPage = pageNumber > 1;
  const hasNextPage = pageNumber < totalPages;

  // Prepare response matching the specified schema
  const result: Paginated<SelfTicketDTO> = {
    items: ticketDTOs,
    pageNumber,
    totalPages,
    totalCount,
    hasPreviousPage,
    hasNextPage,
  };

  const validationSchema = paginateSchema(SelfTicketDTOSchema);
  const parsed = validationSchema.safeParse(result);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getPaginatedSelfTicketsRoute };
