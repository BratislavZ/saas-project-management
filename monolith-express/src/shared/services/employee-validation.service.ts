import { Employee, Organization, Project, User } from "@prisma/client";
import { prisma } from "../lib/prisma";

const isEmployeeInOrganization = async (
  organizationId: Organization["id"],
  employeeId: Employee["id"]
) => {
  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,
      organizationId,
    },
  });
  return !!employee;
};

const isEmployeeInProject = async (
  projectId: Project["id"],
  employeeId: Employee["id"]
) => {
  const member = await prisma.projectMember.findFirst({
    where: {
      employeeId,
      projectId,
    },
  });
  return !!member;
};

const isEmployeeActive = async (employeeId: Employee["id"]) => {
  const user = await prisma.user.findFirst({
    where: {
      employeeId,
      status: "ACTIVE",
    },
  });
  return !!user;
};

export const employeeValidationService = {
  isEmployeeInOrganization,
  isEmployeeInProject,
  isEmployeeActive,
};
