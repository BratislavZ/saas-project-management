import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { isSuperAdmin } from "../../shared/middlewares/is-super-admin";
import { OrganizationDTO, OrganizationDTOSchema } from "./utils/dtos";
import { logger } from "../../shared/lib/logger";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { validateRequest } from "../../shared/validation/validate-request";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.get(
  "/api/organization/:organizationId",
  attachAuthenticatedUser,
  isSuperAdmin,
  getOrganizationHandler
);

const GetOrganizationSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
  }),
});

async function getOrganizationHandler(
  req: Request,
  res: Response<OrganizationDTO>
) {
  const safeData = await validateRequest(GetOrganizationSchema, req);
  const { organizationId } = safeData.params;

  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
      name: true,
      status: true,
      description: true,
    },
  });

  if (!organization) {
    throw new NotFoundError("Organization");
  }

  const parsed = OrganizationDTOSchema.safeParse(organization);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getOrganizationRoute };
