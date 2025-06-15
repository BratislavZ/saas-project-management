import { Request, Response, Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { isSuperAdmin } from "../../shared/middlewares/is-super-admin";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.patch(
  "/api/organization-admin/:organizationAdminId/activate",
  attachAuthenticatedUser,
  isSuperAdmin,
  activateOrganizationAdminHandler
);

const ActivateOrganizationAdminSchema = z.object({
  params: z.object({
    organizationAdminId: commonValidators.organizationAdminId,
  }),
});

async function activateOrganizationAdminHandler(req: Request, res: Response) {
  const safeData = await validateRequest(ActivateOrganizationAdminSchema, req);

  const { organizationAdminId } = safeData.params;

  await prisma.user.update({
    where: {
      organizationAdminId,
    },
    data: {
      status: "ACTIVE",
    },
  });

  res.sendStatus(StatusCodes.NO_CONTENT);
}

export { router as activateOrganizationAdminRoute };
