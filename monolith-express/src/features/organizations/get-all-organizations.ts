import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { isSuperAdmin } from "../../shared/middlewares/is-super-admin";
import { OrganizationDTO, OrganizationDTOSchema } from "./utils/dtos";
import { logger } from "../../shared/lib/logger";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";

const router = Router();

router.get(
  "/api/organizations",
  attachAuthenticatedUser,
  isSuperAdmin,
  getAllOrganizationsHandler
);

async function getAllOrganizationsHandler(
  req: Request,
  res: Response<Array<OrganizationDTO>>
) {
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      description: true,
    },
  });

  const validationSchema = z.array(OrganizationDTOSchema);
  const parsed = validationSchema.safeParse(organizations);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getAllOrganizationsRoute };
