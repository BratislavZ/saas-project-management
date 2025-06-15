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
import { Prisma } from "@prisma/client";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { logger } from "../../shared/lib/logger";
import { fromZodError } from "zod-validation-error";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { RoleDTO, RoleDTOSchema } from "./utils/dtos";
import { organizationValidationService } from "../../shared/services/organization-validation.service";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.get(
  "/api/organization/:organizationId/roles-paginated",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  getPaginatedRolesHandler
);

const SortFieldSchema = z.enum(["name", "description"]);

const GetPaginatedRolesSchema = z.object({
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
  }),
});

async function getPaginatedRolesHandler(
  req: Request,
  res: Response<Paginated<RoleDTO>>
) {
  const safeData = await validateRequest(GetPaginatedRolesSchema, req);
  const { pageNumber, pageSize, searchTerm, sortBy, sortDirection } =
    safeData.query;
  const { organizationId } = safeData.params;

  // Construct dynamic where clause for filtering
  const whereClause: Prisma.RoleWhereInput = {
    organizationId,
  };

  // Sorting, default to createdAt ascending
  const orderBy: Prisma.RoleOrderByWithRelationInput =
    sortBy && sortDirection
      ? { [sortBy]: sortDirection }
      : {
          id: "asc",
        };

  // Add search term filter
  if (searchTerm) {
    whereClause.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  const [totalCount, roles] = await Promise.all([
    // Count projects with the same filters
    prisma.role.count({ where: whereClause }),

    // Projects with filtering, sorting, and pagination
    prisma.role.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        organizationId: true,
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
  const result: Paginated<RoleDTO> = {
    items: roles,
    pageNumber,
    totalPages,
    totalCount,
    hasPreviousPage,
    hasNextPage,
  };

  const validationSchema = paginateSchema(RoleDTOSchema);
  const parsed = validationSchema.safeParse(result);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getPaginatedRolesRoute };
