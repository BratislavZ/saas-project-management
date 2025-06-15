import { Prisma } from "@prisma/client";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { logger } from "../../shared/lib/logger";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { hasRolePermission } from "../../shared/middlewares/has-role-permission";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { projectValidationService } from "../../shared/services/project-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import {
  FilterParamsSchema,
  Paginated,
  paginateSchema,
  PaginationParamsSchema,
  SortDirectionSchema,
} from "../../shared/utils/pagination";
import { validateRequest } from "../../shared/validation/validate-request";
import { ProjectMemberDTO, ProjectMemberDTOSchema } from "./utils/dtos";

const router = Router();

router.get(
  "/api/organization/:organizationId/project/:projectId/members-paginated",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  hasRolePermission({
    allowedPermissions: [
      "PROJECT_MEMBER_VIEW",
      "PROJECT_MEMBER_ADD",
      "PROJECT_MEMBER_REMOVE",
      "PROJECT_MEMBER_ROLE_UPDATE",
    ],
  }),
  getPaginatedProjectMembersHandler
);

const SortFieldSchema = z.enum(["employee", "role"]);

const GetPaginatedProjectMembersSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      projectId: z.coerce.number().int().positive(),
    })
    .refine(
      async (data) => {
        const { organizationId, projectId } = data;

        return await projectValidationService.isProjectInOrganization(
          organizationId,
          projectId
        );
      },
      { message: "Project does not exist" }
    ),
  query: z.object({
    pageNumber: PaginationParamsSchema.shape.pageNumber,
    pageSize: PaginationParamsSchema.shape.pageSize,
    searchTerm: FilterParamsSchema.shape.searchTerm,
    // Sorting
    sortBy: SortFieldSchema.optional(),
    sortDirection: SortDirectionSchema,
    // Filtering
    role: z.coerce.number().int().positive().optional(),
  }),
});

async function getPaginatedProjectMembersHandler(
  req: Request,
  res: Response<Paginated<ProjectMemberDTO>>
) {
  const safeData = await validateRequest(GetPaginatedProjectMembersSchema, req);
  const { pageNumber, pageSize, searchTerm, sortBy, sortDirection, role } =
    safeData.query;
  const { organizationId, projectId } = safeData.params;

  // Construct dynamic where clause for filtering
  const whereClause: Prisma.ProjectMemberWhereInput = {
    organizationId,
    projectId,
  };

  // Add role filter if provided
  if (role) {
    whereClause.roleId = role;
  }

  // Add search term filter
  if (searchTerm) {
    whereClause.OR = [
      {
        employee: {
          name: { contains: searchTerm, mode: "insensitive" },
        },
      },
      {
        employee: {
          email: { contains: searchTerm, mode: "insensitive" },
        },
      },
    ];
  }

  // Sorting
  let orderBy: Prisma.ProjectMemberOrderByWithRelationInput = {
    createdAt: "desc", // Default sorting
  };

  if (sortBy && sortDirection) {
    if (sortBy === "employee") {
      orderBy = { employee: { name: sortDirection } };
    } else if (sortBy === "role") {
      orderBy = { role: { name: sortDirection } };
    } else {
      orderBy = { [sortBy]: sortDirection };
    }
  }

  const [totalCount, projectMembers] = await Promise.all([
    // Count project members with the same filters
    prisma.projectMember.count({ where: whereClause }),

    // Project members with filtering, sorting, and pagination
    prisma.projectMember.findMany({
      where: whereClause,
      select: {
        id: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
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

  // Prepare response
  const result: Paginated<ProjectMemberDTO> = {
    items: projectMembers,
    pageNumber,
    totalPages,
    totalCount,
    hasPreviousPage,
    hasNextPage,
  };

  const validationSchema = paginateSchema(ProjectMemberDTOSchema);
  const parsed = validationSchema.safeParse(result);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getPaginatedProjectMembersRoute };
