import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ForbiddenError } from "../errors/forbidden-error";

const paramsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
});

export const isOrganizationEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser = req.currentUser;

  const { organizationId } = paramsSchema.parse(req.params);

  const hasOrganizationAccess =
    currentUser.employee?.organizationId === organizationId;

  if (currentUser.employee && hasOrganizationAccess) {
    next();
    return;
  }

  throw new ForbiddenError();
};
