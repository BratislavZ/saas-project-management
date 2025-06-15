import { prisma } from "../lib/prisma";

const isUserEmailUnique = async (email: string) => {
  // first check if email is in Employee table, most common case
  const employeeWithSameEmail = await prisma.employee.findUnique({
    where: {
      email,
    },
  });

  if (employeeWithSameEmail) {
    return false;
  }

  // then check if email is in OrganizationAdmin table
  const organizationAdminWithSameEmail =
    await prisma.organizationAdmin.findUnique({
      where: {
        email,
      },
    });
  if (organizationAdminWithSameEmail) {
    return false;
  }

  // then check if email is in SuperAdmin table
  const superAdminWithSameEmail = await prisma.superAdmin.findUnique({
    where: {
      email: email,
    },
  });
  if (superAdminWithSameEmail) {
    return false;
  }

  return true;
};

export const userManagementService = {
  isUserEmailUnique,
};
