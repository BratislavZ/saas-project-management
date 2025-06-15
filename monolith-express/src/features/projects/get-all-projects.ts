import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { ProjectDTO, ProjectDTOSchema } from "./utils/dtos";
import { logger } from "../../shared/lib/logger";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { validateRequest } from "../../shared/validation/validate-request";
import { organizationValidationService } from "../../shared/services/organization-validation.service";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.get(
  "/api/organization/:organizationId/projects",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  getAllProjectsHandler
);

const GetAllProjectsSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
  }),
  query: z.object({
    includeArchived: z.literal("true").optional(),
  }),
});

async function getAllProjectsHandler(
  req: Request,
  res: Response<Array<Pick<ProjectDTO, "id" | "name" | "status">>>
) {
  const safeData = await validateRequest(GetAllProjectsSchema, req);
  const { organizationId } = safeData.params;

  const organizations = await prisma.project.findMany({
    where: {
      organizationId,
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  const validationSchema = z.array(
    ProjectDTOSchema.pick({ id: true, name: true, status: true })
  );
  const parsed = validationSchema.safeParse(organizations);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getAllProjectsRoute };
