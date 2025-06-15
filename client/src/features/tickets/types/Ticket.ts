import { z } from "zod";
import { TicketPrioritySchema } from "./TicketPriority";
import { TicketTypeSchema } from "./TicketType";

export const TicketSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().nullable(),
  priority: TicketPrioritySchema,
  type: TicketTypeSchema,
  position: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  dueDate: z.string().datetime().nullable(),
  assigneeId: z.number().int().positive().nullable(),
  ticketColumn: z.object({
    id: z.number().int().positive(),
    name: z.string(),
  }),
  assignee: z
    .object({
      id: z.number().int().positive(),
      name: z.string(),
      email: z.string().email(),
    })
    .nullable(),
  project: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    organizationId: z.number().int().positive(),
  }),
});

export type Ticket = z.infer<typeof TicketSchema>;

export const TicketInColumnSchema = TicketSchema.pick({
  id: true,
  title: true,
  priority: true,
  type: true,
  dueDate: true,
  assignee: true,
  position: true,
});
export type TicketInColumn = z.infer<typeof TicketInColumnSchema>;
