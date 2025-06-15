import { z } from "zod";
import { TicketSchema } from "./Ticket";

export const SelfTicketSchema = TicketSchema.pick({
  id: true,
  title: true,
  priority: true,
  type: true,
  dueDate: true,
  project: true,
});

export type SelfTicket = z.infer<typeof SelfTicketSchema>;
