import { Organization } from "@prisma/client";
import { prisma } from "../lib/prisma";

const isOrganizationNameUnique = async (
  name: Organization["name"],
  organizationId?: Organization["id"]
) => {
  const count = await prisma.organization.count({
    where: {
      AND: [
        { name: { equals: name, mode: "insensitive" } },
        ...(organizationId ? [{ id: { not: organizationId } }] : []),
      ],
    },
  });
  return count === 0;
};

const organizationsExists = async (organizationId: Organization["id"]) => {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });
  return !!organization;
};

export const organizationValidationService = {
  isOrganizationNameUnique,
  organizationsExists,
};
