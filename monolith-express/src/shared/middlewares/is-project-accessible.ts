import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ForbiddenError } from "../errors/forbidden-error";
import { prisma } from "../lib/prisma";

const paramsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
  projectId: z.coerce.number().int().positive(),
});

export const isProjectAccessible = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser = req.currentUser;

  const { organizationId, projectId } = paramsSchema.parse(req.params);

  const hasOrganizationAccess =
    currentUser.organizationAdmin?.organizationId === organizationId ||
    currentUser.employee?.organizationId === organizationId;

  // allow access if the user is an organization admin
  if (currentUser.organizationAdmin && hasOrganizationAccess) {
    next();
    return;
  }

  // allow access if user is a member of the project
  if (currentUser.employeeId && hasOrganizationAccess) {
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId,
        organizationId,
        employeeId: currentUser.employeeId,
      },
    });

    if (member) {
      next();
      return;
    }
  }

  throw new ForbiddenError("Project");
};
