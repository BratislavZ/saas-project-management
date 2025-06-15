import { TicketPriority, TicketType } from "@prisma/client";
import { z } from "zod";

export const TicketDTOSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().nullable(),
  priority: z.nativeEnum(TicketPriority),
  type: z.nativeEnum(TicketType),
  dueDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
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
export type TicketDTO = z.infer<typeof TicketDTOSchema>;
