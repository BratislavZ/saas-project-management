import { z } from "zod";
import { TicketPrioritySchema } from "../types/TicketPriority";
import { TicketTypeSchema } from "../types/TicketType";

export const formSchemaTicketColumn = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().nullable(),
});
export type FormTicketColumn = z.infer<typeof formSchemaTicketColumn>;

export const formSchemaTicket = z.object({
  title: z.string().min(1).max(32),
  description: z.string().nullable(),
  columnId: z.number().int().positive(),
  priority: TicketPrioritySchema.nullable(),
  type: TicketTypeSchema.nullable(),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.number().int().positive().optional(),
});
export type FormTicket = z.infer<typeof formSchemaTicket>;
