import { z } from "zod";
import { TicketDTOSchema } from "./TicketDTO";

export const TicketColumnDTOSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullish(),
  projectId: z.number().int().positive(),
  position: z.number().int().nonnegative(),
  tickets: z.array(
    TicketDTOSchema.pick({
      id: true,
      title: true,
      priority: true,
      type: true,
      dueDate: true,
      assignee: true,
    }).extend({
      position: z.number().int().nonnegative(),
    })
  ),
});
export type TicketColumnDTO = z.infer<typeof TicketColumnDTOSchema>;
