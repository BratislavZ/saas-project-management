import { Prisma } from "@prisma/client";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { logger } from "../../shared/lib/logger";
import { prisma } from "../../shared/lib/prisma";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { roleValidationService } from "../../shared/services/role-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import {
  FilterParamsSchema,
  Paginated,
  paginateSchema,
  PaginationParamsSchema,
} from "../../shared/utils/pagination";
import { validateRequest } from "../../shared/validation/validate-request";
import { EmployeeDTOSchema } from "../employees/utils/dtos";

const router = Router();

router.get(
  "/api/organization/:organizationId/role/:roleId/members-paginated",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  getPaginatedRoleMembersHandler
);

const GetPaginatedRoleMembersSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      roleId: z.coerce.number().int().positive(),
    })
    .refine(
      async (params) => {
        return await roleValidationService.isRoleInOrganization(
          params.organizationId,
          params.roleId
        );
      },
      {
        message: "Role does not exist in this organization",
        path: ["roleId"],
      }
    ),
  query: z.object({
    pageNumber: PaginationParamsSchema.shape.pageNumber,
    pageSize: PaginationParamsSchema.shape.pageSize,
    searchTerm: FilterParamsSchema.shape.searchTerm,
  }),
});

// Create a DTO for member data
const MemberDTOSchema = EmployeeDTOSchema.pick({
  id: true,
  name: true,
  email: true,
});

type MemberDTO = z.infer<typeof MemberDTOSchema>;

async function getPaginatedRoleMembersHandler(
  req: Request,
  res: Response<Paginated<MemberDTO>>
) {
  const safeData = await validateRequest(GetPaginatedRoleMembersSchema, req);
  const { pageNumber, pageSize, searchTerm } = safeData.query;
  const { organizationId, roleId } = safeData.params;

  // 1. First get total count of distinct users
  const countQuery = Prisma.sql`
    SELECT COUNT(DISTINCT pm."employeeId")::integer as total
    FROM "ProjectMember" pm
    JOIN "Employee" u ON pm."employeeId" = u.id
    WHERE pm."organizationId" = ${organizationId}
    AND pm."roleId" = ${roleId}
    ${
      searchTerm
        ? Prisma.sql`
      AND (u.name ILIKE ${`%${searchTerm}%`} OR u.email ILIKE ${`%${searchTerm}%`})
    `
        : Prisma.empty
    }
  `;

  const whereClause: Prisma.ProjectMemberWhereInput = {
    organizationId,
    roleId,
  };

  if (searchTerm) {
    whereClause.employee = {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ],
    };
  }

  // Execute both queries in parallel
  const [totalCountResult, members] = await Promise.all([
    prisma.$queryRaw<{ total: number }[]>(countQuery),
    prisma.projectMember.findMany({
      where: whereClause,
      select: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      distinct: ["employeeId"],
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    }),
  ]);

  const totalCount = totalCountResult[0]?.total || 0;

  // Build response
  const response: Paginated<MemberDTO> = {
    items: members.map((member) => member.employee),
    pageNumber,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount,
    hasPreviousPage: pageNumber > 1,
    hasNextPage: pageNumber * pageSize < totalCount,
  };

  // Validate output
  const validation = paginateSchema(MemberDTOSchema).safeParse(response);
  if (!validation.success) {
    logger.error(fromZodError(validation.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(validation.data);
}

export { router as getPaginatedRoleMembersRoute };
