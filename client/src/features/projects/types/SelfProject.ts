import { z } from "zod";

export const SelfProjectSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  role: z.object({
    id: z.number(),
    name: z.string(),
  }),
  createdAt: z.string().datetime(),
});
export type SelfProject = z.infer<typeof SelfProjectSchema>;
