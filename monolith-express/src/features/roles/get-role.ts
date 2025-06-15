import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { logger } from "../../shared/lib/logger";
import { prisma } from "../../shared/lib/prisma";
import { validateRequest } from "../../shared/validation/validate-request";

import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { commonValidators } from "../../shared/utils/common-validators";
import { RoleDTO, RoleDTOSchema } from "./utils/dtos";

const router = Router();

router.get(
  "/api/organization/:organizationId/role/:roleId",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  getRoleHandler
);

const GetProjectSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
    roleId: z.coerce.number().int().positive(),
  }),
});

async function getRoleHandler(req: Request, res: Response<RoleDTO>) {
  const safeData = await validateRequest(GetProjectSchema, req);
  const { roleId } = safeData.params;

  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      organizationId: true,
      permissions: {
        select: {
          permission: {
            select: {
              id: true,
              code: true,
              group: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!role) {
    throw new NotFoundError("Role");
  }

  const result: RoleDTO = {
    ...role,
    permissions: role.permissions.map((permission) => permission.permission),
  };

  const parsed = RoleDTOSchema.safeParse(result);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getRoleRoute };
