import { Request, Response, Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { roleValidationService } from "../../shared/services/role-validation.service";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.delete(
  "/api/organization/:organizationId/role/:roleId",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  deleteRoleHandler
);

const DeleteRoleSchema = z.object({
  params: z
    .object({
      organizationId: commonValidators.organizationId,
      roleId: z.coerce.number().int().positive(),
    })
    .superRefine(async ({ organizationId, roleId }, ctx) => {
      const [isRoleInOrganization, isRoleUsed] = await Promise.all([
        roleValidationService.isRoleInOrganization(organizationId, roleId),
        roleValidationService.isRoleUsed(roleId),
      ]);

      if (!isRoleInOrganization) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Role does not exist",
        });
      }

      if (isRoleUsed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Role is used",
        });
      }
    }),
});

async function deleteRoleHandler(req: Request, res: Response) {
  const safeData = await validateRequest(DeleteRoleSchema, req);

  const { roleId } = safeData.params;

  await prisma.role.delete({
    where: {
      id: roleId,
    },
  });

  res.sendStatus(StatusCodes.NO_CONTENT);
}

export { router as deleteRoleRoute };
