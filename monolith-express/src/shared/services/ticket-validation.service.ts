import {
  Organization,
  Project,
  Role,
  Ticket,
  TicketColumn,
} from "@prisma/client";
import { prisma } from "../lib/prisma";

const isTicketInProject = async (
  projectId: Project["id"],
  ticketId: Ticket["id"]
) => {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      projectId,
    },
  });
  return !!ticket;
};

const isTicketColumnInProject = async (
  projectId: Ticket["projectId"],
  columnId: TicketColumn["id"]
) => {
  const ticketColumn = await prisma.ticketColumn.findFirst({
    where: {
      id: columnId,
      projectId,
    },
  });
  return !!ticketColumn;
};

export const ticketValidationService = {
  isTicketInProject,
  isTicketColumnInProject,
};
