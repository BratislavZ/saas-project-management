import { PermissionCode } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ForbiddenError } from "../errors/forbidden-error";
import { prisma } from "../lib/prisma";

const paramsSchema = z.object({
  organizationId: z.coerce.number().int().positive(),
  projectId: z.coerce.number().int().positive(),
});

type Props = {
  allowedPermissions: Array<PermissionCode>;
  allowOrganizationAdmin?: boolean;
};

export function hasRolePermission({
  allowedPermissions,
  allowOrganizationAdmin = true,
}: Props) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const currentUser = req.currentUser;

    const { organizationId, projectId } = paramsSchema.parse(req.params);

    const hasOrganizationAccess =
      currentUser.organizationAdmin?.organizationId === organizationId ||
      currentUser.employee?.organizationId === organizationId;

    if (
      allowOrganizationAdmin &&
      currentUser.organizationAdmin &&
      hasOrganizationAccess
    ) {
      next();
      return;
    }

    if (currentUser.employeeId && hasOrganizationAccess) {
      // Check if the user is a member of the project with any of the allowed permissions
      const memberWithPermission = await prisma.projectMember.findFirst({
        where: {
          projectId,
          organizationId,
          employeeId: currentUser.employeeId,
        },
        include: {
          role: {
            select: {
              permissions: {
                where: {
                  permission: {
                    code: {
                      in: allowedPermissions,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (
        memberWithPermission &&
        memberWithPermission.role.permissions.length > 0
      ) {
        next();
        return;
      }
    }

    throw new ForbiddenError();
  };
}
