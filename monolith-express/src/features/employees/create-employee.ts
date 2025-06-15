import { Request, Response, Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request";
import { z } from "zod";
import { userManagementService } from "../../shared/services/user-management.service";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { authService } from "../../shared/services/auth.service";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.post(
  "/api/organization/:organizationId/employee",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  createEmployeeHandler
);

const CreateEmployeeSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
  }),
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
  }),
});

async function createEmployeeHandler(req: Request, res: Response) {
  const safeData = await validateRequest(CreateEmployeeSchema, req);
  const { name, email } = safeData.body;
  const { organizationId } = safeData.params;

  var clerkUser = await authService.createClerkUser(email);

  if (!clerkUser) {
    throw new InternalServerError("Failed to create user");
  }

  const newEmployee = await prisma.employee.create({
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
    message: "Employee created",
    userId: newEmployee.id,
  });
}

export { router as createEmployeeRoute };
