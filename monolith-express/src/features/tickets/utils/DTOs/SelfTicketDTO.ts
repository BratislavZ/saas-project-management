import { z } from "zod";
import { TicketDTOSchema } from "./TicketDTO";

export const SelfTicketDTOSchema = TicketDTOSchema.pick({
  id: true,
  title: true,
  priority: true,
  type: true,
  dueDate: true,
  project: true,
});

export type SelfTicketDTO = z.infer<typeof SelfTicketDTOSchema>;
