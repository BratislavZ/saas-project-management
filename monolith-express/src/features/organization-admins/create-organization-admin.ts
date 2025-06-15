import { Request, Response, Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request";
import { z } from "zod";
import { userManagementService } from "../../shared/services/user-management.service";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { isSuperAdmin } from "../../shared/middlewares/is-super-admin";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { authService } from "../../shared/services/auth.service";
import { commonValidators } from "../../shared/utils/common-validators";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";

const router = Router();

router.post(
  "/api/organization-admin",
  attachAuthenticatedUser,
  isSuperAdmin,
  createOrganizationAdminHandler
);

const CreateOrganizationAdminSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(32),
    email: z
      .string()
      .email()
      .refine(
        async (name) => await userManagementService.isUserEmailUnique(name),
        {
          message: "User email already exists",
        }
      ),
    organizationId: commonValidators.organizationId,
  }),
});

async function createOrganizationAdminHandler(req: Request, res: Response) {
  const safeData = await validateRequest(CreateOrganizationAdminSchema, req);
  const { name, email, organizationId } = safeData.body;

  var clerkUser = await authService.createClerkUser(email);

  if (!clerkUser) {
    throw new InternalServerError("Failed to create user");
  }

  const newOrganizationAdmin = await prisma.organizationAdmin.create({
    data: {
      name,
      email,
      organizationId,
      user: {
        create: {
          clerkUserId: clerkUser.id,
          status: "ACTIVE",
        },
      },
    },
    select: {
      id: true,
    },
  });

  res.status(StatusCodes.CREATED).json({
    message: "Organization admin created",
    organizationAdminId: newOrganizationAdmin.id,
  });
}

export { router as createOrganizationAdminRoute };
