import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";

import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { logger } from "../../shared/lib/logger";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { isOrganizationEmployee } from "../../shared/middlewares/is-organization-employee";
import { commonValidators } from "../../shared/utils/common-validators";
import { validateRequest } from "../../shared/validation/validate-request";
import { SelfProjectDTO, SelfProjectDTOSchema } from "./utils/dtos";

const router = Router();

router.get(
  "/api/organization/:organizationId/self/projects",
  attachAuthenticatedUser,
  isOrganizationEmployee,
  getAllSelfProjectsHandler
);

const GetAllSelfProjectsSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
  }),
});

async function getAllSelfProjectsHandler(
  req: Request,
  res: Response<Array<Pick<SelfProjectDTO, "id" | "name">>>
) {
  const safeData = await validateRequest(GetAllSelfProjectsSchema, req);
  const { organizationId } = safeData.params;

  const { employeeId } = req.currentUser;
  if (!employeeId) {
    throw new NotFoundError("Employee");
  }

  const projectMemberships = await prisma.projectMember.findMany({
    where: {
      employeeId,
      organizationId,
      project: {
        status: "ACTIVE", // Only active projects
      },
    },
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
    },
  });

  // Transform to DTO
  const projects: Array<Pick<SelfProjectDTO, "id" | "name">> =
    projectMemberships.map((membership) => ({
      id: membership.project.id,
      name: membership.project.name,
    }));

  const validationSchema = z.array(
    SelfProjectDTOSchema.pick({
      id: true,
      name: true,
    })
  );
  const parsed = validationSchema.safeParse(projects);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getAllSelfProjectsRoute };
