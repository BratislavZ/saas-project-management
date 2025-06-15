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
  "/api/organization/:organizationId/activate",
  attachAuthenticatedUser,
  isSuperAdmin,
  activateOrganizationHandler
);

const ActivateOrganizationSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
  }),
});

async function activateOrganizationHandler(req: Request, res: Response) {
  const safeData = await validateRequest(ActivateOrganizationSchema, req);

  const { organizationId } = safeData.params;

  await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  res.sendStatus(StatusCodes.NO_CONTENT);
}

export { router as activateOrganizationRoute };
