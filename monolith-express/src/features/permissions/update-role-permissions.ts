import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { validateRequest } from "../../shared/validation/validate-request";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { roleValidationService } from "../../shared/services/role-validation.service";
import { permissionValidatorService } from "../../shared/services/permission-validaton.service";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.patch(
  "/api/organization/:organizationId/role/:roleId/permissions",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  updateRolePermissionsHandler
);

const UpdateRolePermissionsSchema = z.object({
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
    permissionIds: z
      .array(z.number().int().positive())
      .refine(
        async (permissionIds) =>
          await permissionValidatorService.arePermissionsValid(permissionIds),
        {
          message: "Invalid permissions",
        }
      ),
  }),
});

async function updateRolePermissionsHandler(req: Request, res: Response) {
  const safeData = await validateRequest(UpdateRolePermissionsSchema, req);

  const { organizationId, roleId } = safeData.params;
  const { permissionIds } = safeData.body;

  const role = await prisma.role.update({
    where: {
      id: roleId,
      organizationId,
    },
    data: {
      permissions: {
        // First delete all existing permissions
        deleteMany: {},
        // Then create new permissions
        create: permissionIds.map((permissionId) => ({
          permission: { connect: { id: permissionId } },
        })),
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  res.status(StatusCodes.OK).json({
    message: `${role.name} permissions updated.`,
    projectId: role.id,
  });
}

export { router as updateRolePermissionsRoute };
