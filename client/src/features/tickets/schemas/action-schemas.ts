import { ServerError } from "@/shared/lib/error";
import { z } from "zod";
import { Ticket } from "../types/Ticket";
import { TicketColumn } from "../types/TicketColumn";
import { TicketPrioritySchema } from "../types/TicketPriority";
import { TicketTypeSchema } from "../types/TicketType";

export const CreateTicketSchema = z.object({
  title: z.string().min(1).max(32),
  description: z.string().max(256).nullable(),
  organizationId: z.number().int().positive(),
  projectId: z.number().int().positive(),
  columnId: z.number().int().positive(),
  priority: TicketPrioritySchema.nullable(),
  type: TicketTypeSchema.nullable(),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.number().int().positive().optional(),
});
export type ActionInputCreateTicket = z.infer<typeof CreateTicketSchema>;
export type ActionOutputCreateTicket = {
  error?: ServerError;
  ticketId?: Ticket["id"];
};

export const EditTicketSchema = CreateTicketSchema.extend({
  ticketId: z.number().int().positive(),
});
export type ActionInputEditTicket = z.infer<typeof EditTicketSchema>;
export type ActionOutputEditTicket = {
  error?: ServerError;
  ticketId?: Ticket["id"];
};

export const DeleteTicketSchema = z.object({
  organizationId: z.number().int().positive(),
  projectId: z.number().int().positive(),
  ticketId: z.number().int().positive(),
});
export type ActionInputDeleteTicket = z.infer<typeof DeleteTicketSchema>;
export type ActionOutputDeleteTicket = {
  error?: ServerError;
};

export const CreateTicketColumnSchema = z.object({
  name: z.string().min(1).max(32),
  description: z.string().max(256).nullable(),
  organizationId: z.number().int().positive(),
  projectId: z.number().int().positive(),
});
export type ActionInputCreateTicketColumn = z.infer<
  typeof CreateTicketColumnSchema
>;
export type ActionOutputCreateTicketColumn = {
  error?: ServerError;
  ticketColumnId?: TicketColumn["id"];
};

export const EditTicketColumnSchema = CreateTicketColumnSchema.extend({
  ticketColumnId: z.number().int().positive(),
});
export type ActionInputEditTicketColumn = z.infer<
  typeof EditTicketColumnSchema
>;
export type ActionOutputEditTicketColumn = {
  error?: ServerError;
  ticketColumnId?: TicketColumn["id"];
};

export const DeleteTicketColumnSchema = z.object({
  organizationId: z.number().int().positive(),
  projectId: z.number().int().positive(),
  ticketColumnId: z.number().int().positive(),
});
export type ActionInputDeleteTicketColumn = z.infer<
  typeof DeleteTicketColumnSchema
>;
export type ActionOutputDeleteTicketColumn = {
  error?: ServerError;
};

export const ReorderTicketsSchema = z.object({
  organizationId: z.number().int().positive(),
  projectId: z.number().int().positive(),
  tickets: z.array(
    z.object({
      id: z.number().int().positive(),
      position: z.number().int().nonnegative(),
      ticketColumnId: z.number().int().positive(),
    })
  ),
});
export type ActionInputReorderTickets = z.infer<typeof ReorderTicketsSchema>;
export type ActionOutputReorderTickets = {
  error?: ServerError;
};

export const ReorderTicketColumnsSchema = z.object({
  organizationId: z.number().int().positive(),
  projectId: z.number().int().positive(),
  ticketColumns: z.array(
    z.object({
      id: z.number().int().positive(),
      position: z.number().int().nonnegative(),
    })
  ),
});
export type ActionInputReorderTicketColumns = z.infer<
  typeof ReorderTicketColumnsSchema
>;
export type ActionOutputReorderTicketColumns = {
  error?: ServerError;
};
