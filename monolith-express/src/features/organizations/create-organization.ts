import { Request, Response, Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request";
import { z } from "zod";

import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { isSuperAdmin } from "../../shared/middlewares/is-super-admin";
import { organizationValidationService } from "../../shared/services/organization-validation.service";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";

const router = Router();

router.post(
  "/api/organization",
  attachAuthenticatedUser,
  isSuperAdmin,
  createOrganizationHandler
);

const CreateOrganizationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1)
      .max(32)
      .refine(
        async (name) =>
          await organizationValidationService.isOrganizationNameUnique(name),
        {
          message: "Organization name already exists",
        }
      ),
    description: z.string().max(80).optional(),
  }),
});

export async function createOrganizationHandler(req: Request, res: Response) {
  const safeData = await validateRequest(CreateOrganizationSchema, req);

  const { name, description } = safeData.body;

  const newOrganization = await prisma.organization.create({
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

  res.status(StatusCodes.CREATED).json({
    message: "Organization created",
    organizationId: newOrganization.id,
  });
}

export { router as createOrganizationRoute };
