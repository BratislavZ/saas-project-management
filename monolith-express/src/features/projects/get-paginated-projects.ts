import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { validateRequest } from "../../shared/validation/validate-request";
import {
  FilterParamsSchema,
  Paginated,
  paginateSchema,
  PaginationParamsSchema,
  SortDirectionSchema,
} from "../../shared/utils/pagination";
import { Prisma, ProjectStatus } from "@prisma/client";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { logger } from "../../shared/lib/logger";
import { fromZodError } from "zod-validation-error";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { ProjectDTO, ProjectDTOSchema } from "./utils/dtos";
import { organizationValidationService } from "../../shared/services/organization-validation.service";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.get(
  "/api/organization/:organizationId/projects-paginated",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  getPaginatedProjectsHandler
);

const SortFieldSchema = z.enum(["name", "description", "status", "createdAt"]);

const GetPaginatedProjectsSchema = z.object({
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
    status: z
      .nativeEnum(ProjectStatus, { message: "Invalid status value" })
      .optional(),
  }),
});

async function getPaginatedProjectsHandler(
  req: Request,
  res: Response<Paginated<ProjectDTO>>
) {
  const safeData = await validateRequest(GetPaginatedProjectsSchema, req);
  const { pageNumber, pageSize, searchTerm, sortBy, sortDirection, status } =
    safeData.query;
  const { organizationId } = safeData.params;

  // Construct dynamic where clause for filtering
  const whereClause: Prisma.ProjectWhereInput = {
    organizationId,
  };

  // Sorting, default to createdAt ascending
  const orderBy: Prisma.ProjectOrderByWithRelationInput =
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

  const [totalCount, projects] = await Promise.all([
    // Count projects with the same filters
    prisma.project.count({ where: whereClause }),

    // Projects with filtering, sorting, and pagination
    prisma.project.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        status: true,
        description: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
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
  const result: Paginated<ProjectDTO> = {
    items: projects,
    pageNumber,
    totalPages,
    totalCount,
    hasPreviousPage,
    hasNextPage,
  };

  const validationSchema = paginateSchema(ProjectDTOSchema);
  const parsed = validationSchema.safeParse(result);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getPaginatedProjectsRoute };
