"use server";

import { serverAction } from "@/shared/utils/server-action";
import {
  ActionInputCreateTicket,
  ActionInputCreateTicketColumn,
  ActionInputDeleteTicket,
  ActionInputDeleteTicketColumn,
  ActionInputEditTicket,
  ActionInputEditTicketColumn,
  ActionInputReorderTicketColumns,
  ActionInputReorderTickets,
  ActionOutputCreateTicket,
  ActionOutputCreateTicketColumn,
  ActionOutputDeleteTicket,
  ActionOutputDeleteTicketColumn,
  ActionOutputEditTicket,
  ActionOutputEditTicketColumn,
  ActionOutputReorderTicketColumns,
  ActionOutputReorderTickets,
  CreateTicketColumnSchema,
  CreateTicketSchema,
  DeleteTicketColumnSchema,
  DeleteTicketSchema,
  EditTicketColumnSchema,
  EditTicketSchema,
  ReorderTicketColumnsSchema,
  ReorderTicketsSchema,
} from "./schemas/action-schemas";
import { revalidatePath } from "next/cache";
import { PATHS } from "@/shared/lib/paths";

export const createTicketAction = async (
  data: ActionInputCreateTicket
): Promise<ActionOutputCreateTicket> => {
  const response = await serverAction.execute(
    {
      method: "POST",
      endpoint: ({ organizationId, projectId }) =>
        `/api/organization/${organizationId}/project/${projectId}/ticket`,
      schema: CreateTicketSchema,
      transformResponse: (responseData) => ({
        ticketId: responseData,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.EMPLOYEE.projectId(data.organizationId, data.projectId));

  return response.data;
};

export const editTicketAction = async (
  data: ActionInputEditTicket
): Promise<ActionOutputEditTicket> => {
  const response = await serverAction.execute(
    {
      method: "PUT",
      endpoint: ({ organizationId, projectId, ticketId }) =>
        `/api/organization/${organizationId}/project/${projectId}/ticket/${ticketId}`,
      schema: EditTicketSchema,
      transformResponse: (responseData) => ({
        ticketId: responseData,
      }),
    },
    data
  );
  if (response.error) {
    return { error: response.error };
  }
  revalidatePath(PATHS.EMPLOYEE.projectId(data.organizationId, data.projectId));
  return response.data;
};

export const deleteTicketAction = async (
  data: ActionInputDeleteTicket
): Promise<ActionOutputDeleteTicket> => {
  const response = await serverAction.execute(
    {
      method: "DELETE",
      endpoint: ({ organizationId, projectId, ticketId }) =>
        `/api/organization/${organizationId}/project/${projectId}/ticket/${ticketId}`,
      schema: DeleteTicketSchema,
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.EMPLOYEE.projectId(data.organizationId, data.projectId));

  return {};
};

export const createTicketColumnAction = async (
  data: ActionInputCreateTicketColumn
): Promise<ActionOutputCreateTicketColumn> => {
  const response = await serverAction.execute(
    {
      method: "POST",
      endpoint: ({ organizationId, projectId }) =>
        `/api/organization/${organizationId}/project/${projectId}/column`,
      schema: CreateTicketColumnSchema,
      transformResponse: (responseData) => ({
        ticketColumnId: responseData,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.EMPLOYEE.projectId(data.organizationId, data.projectId));

  return response.data;
};

export const editTicketColumnAction = async (
  data: ActionInputEditTicketColumn
): Promise<ActionOutputEditTicketColumn> => {
  const response = await serverAction.execute(
    {
      method: "PUT",
      endpoint: ({ organizationId, projectId, ticketColumnId }) =>
        `/api/organization/${organizationId}/project/${projectId}/column/${ticketColumnId}`,
      schema: EditTicketColumnSchema,
      transformResponse: (responseData) => ({
        ticketColumnId: responseData,
      }),
    },
    data
  );
  if (response.error) {
    return { error: response.error };
  }
  revalidatePath(PATHS.EMPLOYEE.projectId(data.organizationId, data.projectId));
  return response.data;
};

export const deleteTicketColumnAction = async (
  data: ActionInputDeleteTicketColumn
): Promise<ActionOutputDeleteTicketColumn> => {
  const response = await serverAction.execute(
    {
      method: "DELETE",
      endpoint: ({ organizationId, projectId, ticketColumnId }) =>
        `/api/organization/${organizationId}/project/${projectId}/column/${ticketColumnId}`,
      schema: DeleteTicketColumnSchema,
    },
    data
  );
  if (response.error) {
    return { error: response.error };
  }
  revalidatePath(PATHS.EMPLOYEE.projectId(data.organizationId, data.projectId));
  return {};
};

export const reorderTicketsAction = async (
  data: ActionInputReorderTickets
): Promise<ActionOutputReorderTickets> => {
  const response = await serverAction.execute(
    {
      method: "PUT",
      endpoint: ({ organizationId, projectId }) =>
        `/api/organization/${organizationId}/project/${projectId}/tickets/reorder`,
      schema: ReorderTicketsSchema,
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.EMPLOYEE.projectId(data.organizationId, data.projectId));

  return {};
};

export const reorderColumnsAction = async (
  data: ActionInputReorderTicketColumns
): Promise<ActionOutputReorderTicketColumns> => {
  const response = await serverAction.execute(
    {
      method: "PUT",
      endpoint: ({ organizationId, projectId }) =>
        `/api/organization/${organizationId}/project/${projectId}/columns/reorder`,
      schema: ReorderTicketColumnsSchema,
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.EMPLOYEE.projectId(data.organizationId, data.projectId));

  return {};
};
