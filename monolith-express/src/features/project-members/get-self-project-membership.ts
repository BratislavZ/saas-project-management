import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { logger } from "../../shared/lib/logger";
import { prisma } from "../../shared/lib/prisma"; // Assuming you have prisma instance
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { isOrganizationEmployee } from "../../shared/middlewares/is-organization-employee";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";
import { ProjectMemberDTO, ProjectMemberDTOSchema } from "./utils/dtos";

const router = Router();

router.get(
  "/api/organization/:organizationId/project/:projectId/self/membership",
  attachAuthenticatedUser,
  isProjectAccessible,
  isOrganizationEmployee,
  getSelfProjectMembershipHandler
);

const GetSelfProjectMembershipSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
    projectId: z.coerce.number().int().positive(),
  }),
});

async function getSelfProjectMembershipHandler(
  req: Request,
  res: Response<ProjectMemberDTO>
) {
  const currentUser = req.currentUser;
  if (!currentUser || !currentUser.employeeId) {
    throw new InternalServerError();
  }

  try {
    const safeData = await validateRequest(GetSelfProjectMembershipSchema, req);
    const { organizationId, projectId } = safeData.params;

    const projectMembership = await prisma.projectMember.findFirst({
      where: {
        employeeId: currentUser.employeeId,
        projectId,
        organizationId,
      },
      include: {
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
            permissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    code: true,
                    group: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!projectMembership) {
      throw new NotFoundError("ProjectMembership");
    }

    const mappedMember: ProjectMemberDTO = {
      id: projectMembership.id,
      createdAt: projectMembership.createdAt,
      employee: {
        id: projectMembership.employee.id,
        name: projectMembership.employee.name,
        email: projectMembership.employee.email,
      },
      role: {
        id: projectMembership.role.id,
        name: projectMembership.role.name,
        permissions: projectMembership.role.permissions.map((rp) => ({
          id: rp.permission.id,
          code: rp.permission.code,
          group: rp.permission.group,
          description: rp.permission.description,
        })),
      },
      project: {
        id: projectMembership.project.id,
        name: projectMembership.project.name,
      },
    };

    const validatedResults = ProjectMemberDTOSchema.safeParse(mappedMember);
    if (!validatedResults.success) {
      logger.error("Validation error:", validatedResults.error);
      throw new InternalServerError();
    }

    res.status(StatusCodes.OK).json(validatedResults.data);
  } catch (error) {
    logger.error("Error fetching project membership:", error);

    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new InternalServerError();
  }
}

export { router as getSelfProjectMembershipRoute };
