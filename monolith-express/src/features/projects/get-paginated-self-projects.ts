import { Prisma } from "@prisma/client";
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
import { SelfProjectDTO, SelfProjectDTOSchema } from "./utils/dtos";

const router = Router();

router.get(
  "/api/organization/:organizationId/self/projects-paginated",
  attachAuthenticatedUser,
  isOrganizationEmployee,
  getPaginatedSelfProjectsHandler
);

const SortFieldSchema = z.enum(["name", "role", "createdAt"]);

const GetPaginatedSelfProjectsSchema = z.object({
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

    // Filtering by role
    role: z.coerce.number().int().positive().optional(),
  }),
});

async function getPaginatedSelfProjectsHandler(
  req: Request,
  res: Response<Paginated<SelfProjectDTO>>
) {
  const safeData = await validateRequest(GetPaginatedSelfProjectsSchema, req);
  const { pageNumber, pageSize, searchTerm, sortBy, sortDirection, role } =
    safeData.query;

  const { employeeId } = req.currentUser;
  if (!employeeId) {
    throw new NotFoundError("Employee");
  }

  // Construct dynamic where clause for filtering
  const whereClause: Prisma.ProjectMemberWhereInput = {
    employeeId,
    project: {
      status: "ACTIVE", // Only active projects
    },
  };

  // Add role filter if provided
  if (role) {
    whereClause.roleId = role;
  }

  // Add search term filter for project name and description
  if (searchTerm) {
    whereClause.project = {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
    };
  }

  // Sorting logic
  let orderBy: Prisma.ProjectMemberOrderByWithRelationInput;

  if (sortBy && sortDirection) {
    switch (sortBy) {
      case "name":
        orderBy = { project: { name: sortDirection } };
        break;
      case "role":
        orderBy = { role: { name: sortDirection } };
        break;
      case "createdAt":
        orderBy = { project: { createdAt: sortDirection } };
        break;
      default:
        orderBy = { project: { createdAt: "asc" } };
    }
  } else {
    orderBy = { project: { createdAt: "asc" } };
  }

  const [totalCount, projectMembers] = await Promise.all([
    // Count project memberships with the same filters
    prisma.projectMember.count({ where: whereClause }),

    // Project memberships with filtering, sorting, and pagination
    prisma.projectMember.findMany({
      where: whereClause,
      select: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            organizationId: true,
            createdAt: true,
          },
        },
        role: {
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

  // Transform the data to match DTO
  const projects: SelfProjectDTO[] = projectMembers.map((pm) => ({
    id: pm.project.id,
    organizationId: pm.project.organizationId,
    name: pm.project.name,
    description: pm.project.description,
    role: {
      id: pm.role.id,
      name: pm.role.name,
    },
    createdAt: pm.project.createdAt,
  }));

  // Calculate pagination details
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasPreviousPage = pageNumber > 1;
  const hasNextPage = pageNumber < totalPages;

  // Prepare response matching the specified schema
  const result: Paginated<SelfProjectDTO> = {
    items: projects,
    pageNumber,
    totalPages,
    totalCount,
    hasPreviousPage,
    hasNextPage,
  };

  const validationSchema = paginateSchema(SelfProjectDTOSchema);
  const parsed = validationSchema.safeParse(result);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getPaginatedSelfProjectsRoute };
