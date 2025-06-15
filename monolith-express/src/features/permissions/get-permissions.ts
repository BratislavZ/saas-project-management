import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { logger } from "../../shared/lib/logger";
import { fromZodError } from "zod-validation-error";
import { InternalServerError } from "../../shared/errors/internal-server-error";
import { PermissionDTO, PermissionDTOSchema } from "./utils/dtos";
import { attachAuthenticatedUser } from "../../shared/middlewares/attach-authenticated-user";

const router = Router();

router.get("/api/permissions", attachAuthenticatedUser, getPermissionsHandler);

async function getPermissionsHandler(
  req: Request,
  res: Response<Array<PermissionDTO>>
) {
  const permissions = await prisma.permission.findMany({
    select: {
      id: true,
      code: true,
      group: true,
      description: true,
    },
  });

  const validationSchema = z.array(PermissionDTOSchema);
  const parsed = validationSchema.safeParse(permissions);

  if (!parsed.success) {
    logger.error(fromZodError(parsed.error));
    throw new InternalServerError();
  }

  res.status(StatusCodes.OK).json(parsed.data);
}

export { router as getPermissionsRoute };
