import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { isSuperAdmin } from "../../shared/middlewares/is-super-admin";
import { validateRequest } from "../../shared/validation/validate-request";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.patch(
  "/api/organization-admin/:organizationAdminId",
  attachAuthenticatedUser,
  isSuperAdmin,
  updateOrganizationAdminHandler
);

const UpdateOrganizationAdminSchema = z.object({
  params: z.object({
    organizationAdminId: commonValidators.organizationAdminId,
  }),
  body: z.object({
    name: z.string().min(1).max(32),
  }),
});

async function updateOrganizationAdminHandler(req: Request, res: Response) {
  const safeData = await validateRequest(UpdateOrganizationAdminSchema, req);

  const { organizationAdminId } = safeData.params;
  const { name } = safeData.body;

  const organizationAdmin = await prisma.organizationAdmin.update({
    where: {
      id: organizationAdminId,
    },
    data: {
      name,
    },
    select: {
      id: true,
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Organization admin updated",
    organizationAdminId: organizationAdmin.id,
  });
}

export { router as updateOrganizationAdminRoute };
