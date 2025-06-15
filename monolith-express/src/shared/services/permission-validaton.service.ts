import { Permission } from "@prisma/client";
import { prisma } from "../lib/prisma";

const arePermissionsValid = async (permissionIds: Array<Permission["id"]>) => {
  const permissions = await prisma.permission.findMany({
    where: {
      id: {
        in: permissionIds,
      },
    },
  });
  return permissions.length === permissionIds.length;
};

export const permissionValidatorService = {
  arePermissionsValid,
};
