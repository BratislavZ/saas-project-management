import { Request, Response, Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { isSuperAdmin } from "../../shared/middlewares/is-super-admin";
import { organizationValidationService } from "../../shared/services/organization-validation.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";

const router = Router();

router.patch(
  "/api/organization/:organizationId",
  attachAuthenticatedUser,
  isSuperAdmin,
  updateOrganizationHandler
);

const UpdateOrganizationSchema = z
  .object({
    params: z.object({
      organizationId: commonValidators.organizationId,
    }),
    body: z.object({
      name: z.string().min(1).max(32),
      description: z.string().max(80).optional(),
    }),
  })
  .refine(
    async (data) => {
      const { organizationId } = data.params;
      const { name } = data.body;
      return await organizationValidationService.isOrganizationNameUnique(
        name,
        organizationId
      );
    },
    {
      message: "Organization name already exists",
      path: ["body", "name"],
    }
  );

async function updateOrganizationHandler(req: Request, res: Response) {
  const safeData = await validateRequest(UpdateOrganizationSchema, req);

  const { organizationId } = safeData.params;
  const { name, description } = safeData.body;

  const organization = await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      name,
      description,
    },
    select: {
      id: true,
      name: true,
      status: true,
      description: true,
    },
  });

  res
    .status(StatusCodes.OK)
    .json({ message: "Organization updated", organizationId: organization.id });
}

export { router as updateOrganizationRoute };
