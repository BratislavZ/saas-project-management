import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { isSuperAdmin } from "../../shared/middlewares/is-super-admin";
import { logger } from "../../shared/lib/logger";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { validateRequest } from "../../shared/validation/validate-request";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { OrganizationAdminDTO, OrganizationAdminDTOSchema } from "./utils/dtos";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.get(
  "/api/organization-admin/:organizationAdminId",
  attachAuthenticatedUser,
  isSuperAdmin,
  getOrganizationAdminHandler
);

const GetOrganizationAdminSchema = z.object({
  params: z.object({
    organizationAdminId: commonValidators.organizationAdminId,
  }),
});

async function getOrganizationAdminHandler(
  req: Request,
  res: Response<OrganizationAdminDTO>
) {
  const safeData = await validateRequest(GetOrganizationAdminSchema, req);
  const { organizationAdminId } = safeData.params;

  const organizationAdmin = await prisma.organizationAdmin.findFirst({
    where: {
      id: organizationAdminId,
    },
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
  });

  if (!organizationAdmin) {
    throw new NotFoundError("Organization admin");
  }

  const parsed = OrganizationAdminDTOSchema.safeParse(organizationAdmin);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getOrganizationAdminRoute };
