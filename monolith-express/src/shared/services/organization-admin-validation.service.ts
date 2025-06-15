import { OrganizationAdmin } from "@prisma/client";
import { prisma } from "../lib/prisma";

const organizationAdminExists = async (
  organizationAdminId: OrganizationAdmin["id"]
) => {
  const organizationAdmin = await prisma.organizationAdmin.findFirst({
    where: {
      id: organizationAdminId,
    },
  });
  return !!organizationAdmin;
};

export const organizationAdminValidationService = {
  organizationAdminExists,
};
