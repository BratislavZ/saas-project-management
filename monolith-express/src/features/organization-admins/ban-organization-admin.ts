import { Request, Response, Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { isSuperAdmin } from "../../shared/middlewares/is-super-admin";
import { organizationAdminValidationService } from "../../shared/services/organization-admin-validation.service";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.delete(
  "/api/organization-admin/:organizationAdminId/ban",
  attachAuthenticatedUser,
  isSuperAdmin,
  banOrganizationAdminHandler
);

const BanOrganizationAdminSchema = z.object({
  params: z.object({
    organizationAdminId: commonValidators.organizationAdminId,
  }),
});

async function banOrganizationAdminHandler(req: Request, res: Response) {
  const safeData = await validateRequest(BanOrganizationAdminSchema, req);

  const { organizationAdminId } = safeData.params;

  await prisma.user.update({
    where: {
      organizationAdminId,
    },
    data: {
      status: "BANNED",
    },
  });

  res.sendStatus(StatusCodes.NO_CONTENT);
}

export { router as banOrganizationAdminRoute };
