import { z } from "zod";

export const formSchemaProject = z.object({
  name: z.string().min(1).max(32),
  description: z.string().optional(),
});
export type FormProject = z.infer<typeof formSchemaProject>;
