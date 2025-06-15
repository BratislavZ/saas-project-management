import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors/forbidden-error";
import { z } from "zod";

const paramsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
});

export const isOrganizationAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser = req.currentUser;

  const { organizationId } = paramsSchema.parse(req.params);

  const hasOrganizationAccess =
    currentUser.organizationAdmin?.organizationId === organizationId;

  if (currentUser.organizationAdmin && hasOrganizationAccess) {
    next();
    return;
  }

  throw new ForbiddenError();
};
