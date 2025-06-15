import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { logger } from "../../shared/lib/logger";
import { prisma } from "../../shared/lib/prisma";
import { validateRequest } from "../../shared/validation/validate-request";

import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { isOrganizationAccessible } from "../../shared/middlewares/is-organization-accessible";
import { isProjectAccessible } from "../../shared/middlewares/is-project-accessible";
import { commonValidators } from "../../shared/utils/common-validators";
import { ProjectDTO, ProjectDTOSchema } from "./utils/dtos";

const router = Router();

router.get(
  "/api/organization/:organizationId/project/:projectId",
  attachAuthenticatedUser,
  isOrganizationAccessible,
  isProjectAccessible,
  getProjectHandler
);

const GetProjectSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
    projectId: z.coerce.number().int().positive(),
  }),
});

async function getProjectHandler(req: Request, res: Response<ProjectDTO>) {
  const safeData = await validateRequest(GetProjectSchema, req);
  const { projectId } = safeData.params;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
    },
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
      projectMembers: {},
      createdAt: true,
    },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  const parsed = ProjectDTOSchema.safeParse(project);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getProjectRoute };
