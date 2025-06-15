import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ForbiddenError } from "../errors/forbidden-error";

const paramsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
});

/**
 * Middleware to check if the current user has access to the specified organization.
 *
 * This middleware validates whether the `currentUser` in the request has access
 * to the organization specified in the request parameters. It supports only
 * `OrganizationAdmin` and `Employee`.
 *
 * @throws {ForbiddenError} If the user does not have access to the specified organization.
 */
export const isOrganizationAccessible = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser = req.currentUser;

  const { organizationId } = paramsSchema.parse(req.params);

  const hasOrganizationAccess =
    currentUser.organizationAdmin?.organizationId === organizationId ||
    currentUser.employee?.organizationId === organizationId;

  if (currentUser.organizationAdmin && hasOrganizationAccess) {
    next();
    return;
  }

  if (currentUser.employee && hasOrganizationAccess) {
    next();
    return;
  }

  throw new ForbiddenError();
};
