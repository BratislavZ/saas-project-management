import { Organization, Project, ProjectMember } from "@prisma/client";
import { prisma } from "../lib/prisma";

const isProjectNameUnique = async (
  name: Project["name"],
  organizationId: Organization["id"],
  projectId?: Project["id"]
) => {
  const count = await prisma.project.count({
    where: {
      name: { equals: name, mode: "insensitive" },
      organizationId,
      ...(projectId ? { id: { not: projectId } } : {}),
    },
  });
  return count === 0;
};

const isProjectInOrganization = async (
  organizationId: Organization["id"],
  projectId: Project["id"]
) => {
  const organization = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
    },
  });
  return !!organization;
};

const isProjectActive = async (projectId: Project["id"]) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      status: "ACTIVE",
    },
  });
  return !!project;
};

const isColumnInProject = async (projectId: number, columnId: number) => {
  const column = await prisma.ticketColumn.findFirst({
    where: {
      id: columnId,
      projectId,
    },
  });
  return !!column;
};

const doesColumnHaveTickets = async (columnId: number) => {
  const tickets = await prisma.ticket.findFirst({
    where: {
      ticketColumnId: columnId,
    },
    select: {
      id: true,
    },
  });
  return !!tickets;
};

const isProjectMember = async (
  organizationId: Organization["id"],
  projectId: Project["id"],
  memberId: ProjectMember["id"]
) => {
  const member = await prisma.projectMember.findFirst({
    where: {
      id: memberId,
      projectId,
      organizationId,
    },
    select: {
      id: true,
    },
  });
  return !!member;
};

export const projectValidationService = {
  isProjectNameUnique,
  isProjectInOrganization,
  isProjectActive,
  isColumnInProject,
  doesColumnHaveTickets,
  isProjectMember,
};
