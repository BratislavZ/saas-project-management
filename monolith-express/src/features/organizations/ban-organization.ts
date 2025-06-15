import { Request, Response, Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { isSuperAdmin } from "../../shared/middlewares/is-super-admin";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.delete(
  "/api/organization/:organizationId/ban",
  attachAuthenticatedUser,
  isSuperAdmin,
  banOrganizationHandler
);

const BanOrganizationSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
  }),
});

async function banOrganizationHandler(req: Request, res: Response) {
  const safeData = await validateRequest(BanOrganizationSchema, req);

  const { organizationId } = safeData.params;

  await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      status: "BANNED",
    },
    select: {
      id: true,
    },
  });

  res.sendStatus(StatusCodes.NO_CONTENT);
}

export { router as banOrganizationRoute };
