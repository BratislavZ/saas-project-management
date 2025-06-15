import { Request, Response, Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { getAuth } from "@clerk/express";
import { NotAuthenticatedError } from "../../shared/errors/not-authenticated-error";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { roleValidationService } from "../../shared/services/role-validation.service";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.post(
  "/api/organization/:organizationId/role",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  createRoleHandler
);

const CreateProjectSchema = z
  .object({
    params: z.object({
      organizationId: commonValidators.organizationId,
    }),
    body: z.object({
      name: z.string().min(1).max(32),
      description: z.string().min(1).max(256),
    }),
  })
  .refine(
    async ({ params, body }) =>
      await roleValidationService.isRoleNameUnique({
        organizationId: params.organizationId,
        roleName: body.name,
      }),
    { message: "Role name already exists" }
  );

async function createRoleHandler(req: Request, res: Response) {
  const auth = getAuth(req);

  if (!auth.userId) {
    throw new NotAuthenticatedError();
  }

  const safeData = await validateRequest(CreateProjectSchema, req);
  const { name, description } = safeData.body;
  const { organizationId } = safeData.params;

  const newRole = await prisma.role.create({
    data: {
      name,
      description,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  res.status(StatusCodes.CREATED).json({
    message: "Role created",
    roleId: newRole.id,
  });
}

export { router as createRoleRoute };
