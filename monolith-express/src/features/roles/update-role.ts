import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { validateRequest } from "../../shared/validation/validate-request";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { roleValidationService } from "../../shared/services/role-validation.service";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.patch(
  "/api/organization/:organizationId/role/:roleId",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  updateRoleHandler
);

const UpdateRoleSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      roleId: z.coerce.number().int().positive(),
    })
    .refine(
      async ({ organizationId, roleId }) => {
        return await roleValidationService.isRoleInOrganization(
          organizationId,
          roleId
        );
      },
      {
        message: "Role does not exist",
      }
    ),
  body: z.object({
    name: z.string().min(1).max(32),
    description: z.string().min(1).max(256),
  }),
});

async function updateRoleHandler(req: Request, res: Response) {
  const safeData = await validateRequest(UpdateRoleSchema, req);

  const { organizationId, roleId } = safeData.params;
  const { name, description } = safeData.body;

  const role = await prisma.role.update({
    where: {
      id: roleId,
      organizationId,
    },
    data: {
      name,
      description,
    },
    select: {
      id: true,
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Role updated",
    projectId: role.id,
  });
}

export { router as updateRoleRoute };
