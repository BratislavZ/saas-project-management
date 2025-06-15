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
import { Prisma, UserStatus } from "@prisma/client";
import { OrganizationAdminDTO, OrganizationAdminDTOSchema } from "./utils/dtos";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { logger } from "../../shared/lib/logger";
import { fromZodError } from "zod-validation-error";
import { organizationValidationService } from "../../shared/services/organization-validation.service";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";

const router = Router();

router.get(
  "/api/organization-admins-paginated",
  attachAuthenticatedUser,
  isSuperAdmin,
  getPaginatedOrganizationAdminsHandler
);

const SortFieldSchema = z.enum(["name", "email", "status"]);

const GetPaginatedOrganizationAdminsSchema = z.object({
  query: z.object({
    pageNumber: PaginationParamsSchema.shape.pageNumber,
    pageSize: PaginationParamsSchema.shape.pageSize,

    searchTerm: FilterParamsSchema.shape.searchTerm,

    // Sorting
    sortBy: SortFieldSchema.optional(),
    sortDirection: SortDirectionSchema,

    // Filtering
    status: z
      .nativeEnum(UserStatus, { message: "Invalid enum value" })
      .optional(),
    organizationId: z
      .number()
      .int()
      .positive()
      .optional()
      .refine(async (organizationId) => {
        if (!organizationId) return true; // Skip validation if no ID provided

        return (
          await organizationValidationService.organizationsExists(
            organizationId
          ),
          {
            message: "Organization does not exist",
          }
        );
      }),
  }),
});

async function getPaginatedOrganizationAdminsHandler(
  req: Request,
  res: Response<Paginated<OrganizationAdminDTO>>
) {
  const safeData = await validateRequest(
    GetPaginatedOrganizationAdminsSchema,
    req
  );
  const {
    pageNumber,
    pageSize,
    searchTerm,
    sortBy,
    sortDirection,
    status,
    organizationId,
  } = safeData.query;

  // Construct dynamic where clause for filtering
  const whereClause: Prisma.OrganizationAdminWhereInput = {};

  // Sorting, default to createdAt ascending
  const orderBy: Prisma.OrganizationAdminOrderByWithRelationInput =
    sortBy && sortDirection
      ? { [sortBy]: sortDirection }
      : {
          createdAt: "asc",
        };

  // Add search term filter
  if (searchTerm) {
    whereClause.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  // Add status filter
  if (status) {
    if (!whereClause.user) {
      whereClause.user = {};
    }
    whereClause.user.status = status;
  }
  // Add organization ID filter
  if (organizationId) {
    whereClause.organizationId = organizationId;
  }

  const [totalCount, organizationAdmins] = await Promise.all([
    // Count organization admins with the same filters
    prisma.organizationAdmin.count({ where: whereClause }),

    // Organization admins with filtering, sorting, and pagination
    prisma.organizationAdmin.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        user: {
          select: {
            id: true,
            status: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
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
  const result: Paginated<OrganizationAdminDTO> = {
    items: organizationAdmins,
    pageNumber,
    totalPages,
    totalCount,
    hasPreviousPage,
    hasNextPage,
  };

  const validationSchema = paginateSchema(OrganizationAdminDTOSchema);
  const parsed = validationSchema.safeParse(result);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getPaginatedOrganizationAdminsRoute };
