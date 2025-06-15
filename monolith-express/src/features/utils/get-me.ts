import { Request, Response, Router } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { NotAuthenticatedError } from "../../shared/errors/not-authenticated-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { logger } from "../../shared/lib/logger";
import { fromZodError } from "zod-validation-error";
import { UserStatus } from "@prisma/client";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";

const router = Router();

router.get("/api/utils/me", attachAuthenticatedUser, getMeHandler);

const MeSchema = z.object({
  id: z.number().int().positive(), // employee | organization-admin | super-admin ID
  name: z.string(),
  email: z.string().email(),
  status: z.nativeEnum(UserStatus).optional(),
  organization: z
    .object({
      id: z.number().int().positive(),
      name: z.string(),
      status: z.nativeEnum(UserStatus),
    })
    .optional(),
  isOrganizationAdmin: z.boolean().optional(),
  isSuperAdmin: z.boolean().optional(),
});
type Me = z.infer<typeof MeSchema>;

async function getMeHandler(req: Request, res: Response<Me>) {
  const currentUser = req.currentUser;

  if (!currentUser) {
    throw new NotAuthenticatedError();
  }

  let me: Me | null = null;

  if (currentUser.employee) {
    me = {
      id: currentUser.employee.id,
      name: currentUser.employee.name,
      email: currentUser.employee.email,
      status: currentUser.status,
      organization: {
        id: currentUser.employee.organization.id,
        name: currentUser.employee.organization.name,
        status: currentUser.employee.organization.status,
      },
    };
  } else if (currentUser.organizationAdmin) {
    me = {
      id: currentUser.organizationAdmin.id,
      name: currentUser.organizationAdmin.name,
      email: currentUser.organizationAdmin.email,
      status: currentUser.status,
      organization: {
        id: currentUser.organizationAdmin.organization.id,
        name: currentUser.organizationAdmin.organization.name,
        status: currentUser.organizationAdmin.organization.status,
      },
      isOrganizationAdmin: true,
    };
  } else if (currentUser.superAdmin) {
    me = {
      id: currentUser.superAdmin.id,
      name: currentUser.superAdmin.name,
      email: currentUser.superAdmin.email,
      isSuperAdmin: true,
    };
  }

  const parsed = MeSchema.safeParse(me);
  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
  return;
}

export { router as getMeRoute };
