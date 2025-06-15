import { Organization, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";

const isRoleInOrganization = async (
  organizationId: Organization["id"],
  roleId: Role["id"]
) => {
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      organizationId,
    },
  });
  return !!role;
};

const isRoleUsed = async (roleId: Role["id"]) => {
  // Check if the role is used by any project member
  const projectMember = await prisma.projectMember.findFirst({
    where: {
      roleId,
    },
  });
  return !!projectMember;
};

const isRoleNameUnique = async ({
  organizationId,
  roleName,
  roleId,
}: {
  organizationId: Organization["id"];
  roleName?: Role["name"];
  roleId?: Role["id"];
}) => {
  const count = await prisma.role.count({
    where: {
      organizationId,
      AND: [
        { name: { equals: roleName, mode: "insensitive" } },
        ...(roleId ? [{ id: { not: roleId } }] : []),
      ],
    },
  });
  return count === 0;
};

export const roleValidationService = {
  isRoleInOrganization,
  isRoleUsed,
  isRoleNameUnique,
};
