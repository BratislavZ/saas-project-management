import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { RoleDTO, RoleDTOSchema } from "./utils/dtos";
import { logger } from "../../shared/lib/logger";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { isOrganizationAdmin } from "../../shared/middlewares/is-organization-admin";
import { validateRequest } from "../../shared/validation/validate-request";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";
import { commonValidators } from "../../shared/utils/common-validators";

const router = Router();

router.get(
  "/api/organization/:organizationId/roles",
  attachAuthenticatedUser,
  isOrganizationAdmin,
  getAllRolesHandler
);

const GetAllRolesSchema = z.object({
  params: z.object({
    organizationId: commonValidators.organizationId,
  }),
});

async function getAllRolesHandler(
  req: Request,
  res: Response<Array<Pick<RoleDTO, "id" | "name">>>
) {
  const safeData = await validateRequest(GetAllRolesSchema, req);
  const { organizationId } = safeData.params;

  const roles = await prisma.role.findMany({
    where: {
      organizationId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const validationSchema = z.array(
    RoleDTOSchema.pick({ id: true, name: true })
  );
  const parsed = validationSchema.safeParse(roles);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getAllRolesRoute };
