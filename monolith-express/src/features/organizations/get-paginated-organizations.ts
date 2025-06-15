import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { isSuperAdmin } from "../../shared/middlewares/is-super-admin";
import { validateRequest } from "../../shared/validation/validate-request";
import {
  FilterParamsSchema,
  Paginated,
  paginateSchema,
  PaginationParamsSchema,
  SortDirectionSchema,
} from "../../shared/utils/pagination";
import { OrganizationStatus, Prisma } from "@prisma/client";
import { OrganizationDTO, OrganizationDTOSchema } from "./utils/dtos";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { logger } from "../../shared/lib/logger";
import { fromZodError } from "zod-validation-error";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";

const router = Router();

router.get(
  "/api/organizations-paginated",
  attachAuthenticatedUser,
  isSuperAdmin,
  getPaginatedOrganizationsHandler
);

const SortFieldSchema = z.enum(["name", "status", "description"]);

const GetPaginatedOrganizationSchema = z.object({
  query: z.object({
    pageNumber: PaginationParamsSchema.shape.pageNumber,
    pageSize: PaginationParamsSchema.shape.pageSize,

    searchTerm: FilterParamsSchema.shape.searchTerm,

    // Sorting
    sortBy: SortFieldSchema.optional(),
    sortDirection: SortDirectionSchema,

    // Filtering
    status: z
      .nativeEnum(OrganizationStatus, { message: "Invalid enum value" })
      .optional(),
  }),
});

async function getPaginatedOrganizationsHandler(
  req: Request,
  res: Response<Paginated<OrganizationDTO>>
) {
  const safeData = await validateRequest(GetPaginatedOrganizationSchema, req);
  const { pageNumber, pageSize, searchTerm, sortBy, sortDirection, status } =
    safeData.query;

  // Construct dynamic where clause for filtering
  const whereClause: Prisma.OrganizationWhereInput = {};

  // Sorting, default to createdAt ascending
  const orderBy: Prisma.OrganizationOrderByWithRelationInput =
    sortBy && sortDirection
      ? { [sortBy]: sortDirection }
      : {
          createdAt: "asc",
        };

  // Add search term filter
  if (searchTerm) {
    whereClause.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  // Add status filter
  if (status) {
    whereClause.status = status;
  }

  // Use Promise.all to run independent promises concurrently
  const [totalCount, organizations] = await Promise.all([
    // Count organizations with the same filters
    prisma.organization.count({ where: whereClause }),

    // Organizations with filtering, sorting, and pagination
    prisma.organization.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        status: true,
        description: true,
      },
      orderBy,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  // Calculate pagination details
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasPreviousPage = pageNumber > 1;
  const hasNextPage = pageNumber < totalPages;

  // Prepare response matching the specified schema
  const result: Paginated<OrganizationDTO> = {
    items: organizations,
    pageNumber,
    totalPages,
    totalCount,
    hasPreviousPage,
    hasNextPage,
  };

  const validationSchema = paginateSchema(OrganizationDTOSchema);
  const parsed = validationSchema.safeParse(result);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getPaginatedOrganizationsRoute };
