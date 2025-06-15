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
import { Prisma, UserStatus } from "@prisma/client";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { logger } from "../../shared/lib/logger";
import { fromZodError } from "zod-validation-error";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { EmployeeDTO, EmployeeDTOSchema } from "./utils/dtos";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.get(
  "/api/organization/:organizationId/employees-paginated",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  getPaginatedEmployeesHandler
);

const SortFieldSchema = z.enum(["name", "email", "status", "projectId"]);

const GetPaginatedEmployeesSchema = z
  .object({
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
        .nativeEnum(UserStatus, { message: "Invalid enum value" })
        .optional(),
      projectId: z.coerce.number().int().positive().optional(),
    }),
  })
  .refine(
    async (data) => {
      const { organizationId } = data.params;
      const { projectId } = data.query;
      if (!projectId) return true; // Skip validation if no ID provided

      return await projectValidationService.isProjectInOrganization(
        organizationId,
        projectId
      );
    },
    { message: "Project does not exist" }
  );

async function getPaginatedEmployeesHandler(
  req: Request,
  res: Response<Paginated<EmployeeDTO>>
) {
  const safeData = await validateRequest(GetPaginatedEmployeesSchema, req);
  const {
    pageNumber,
    pageSize,
    searchTerm,
    sortBy,
    sortDirection,
    status,
    projectId,
  } = safeData.query;
  const { organizationId } = safeData.params;

  // Construct dynamic where clause for filtering
  const whereClause: Prisma.EmployeeWhereInput = {
    organizationId,
  };

  // Sorting, default to createdAt ascending
  const orderBy: Prisma.EmployeeOrderByWithRelationInput =
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
  // Add project ID filter
  if (projectId) {
    whereClause.projectMembers = {
      some: {
        projectId,
      },
    };
  }

  const [totalCount, employees] = await Promise.all([
    // Count users with the same filters
    prisma.employee.count({ where: whereClause }),

    // Users with filtering, sorting, and pagination
    prisma.employee.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        user: {
          select: {
            id: true,
            status: true,
          },
        },
        email: true,
        organizationId: true,
        projectMembers: {
          select: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
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
  const result: Paginated<EmployeeDTO> = {
    items: employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      user: employee.user,
      organizationId: employee.organizationId,
      projects: employee.projectMembers.map((member) => ({
        id: member.project.id,
        name: member.project.name,
        status: member.project.status,
      })),
    })),
    pageNumber,
    totalPages,
    totalCount,
    hasPreviousPage,
    hasNextPage,
  };

  const validationSchema = paginateSchema(EmployeeDTOSchema);
  const parsed = validationSchema.safeParse(result);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getPaginatedUsersRoute };
