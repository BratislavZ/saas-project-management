import { z } from "zod";
import { TicketInColumnSchema, TicketSchema } from "./Ticket";

export const TicketColumnSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullish(),
  position: z.number().int().nonnegative(),
  projectId: z.number().int().positive(),
  tickets: z.array(TicketInColumnSchema),
});

export type TicketColumn = z.infer<typeof TicketColumnSchema>;

export const BasicTicketColumnSchema = TicketColumnSchema.pick({
  id: true,
  name: true,
  description: true,
  projectId: true,
});
export type BasicTicketColumn = z.infer<typeof BasicTicketColumnSchema>;
