import { z } from "zod";

export const formSchemaOrganization = z.object({
  name: z.string().min(1).max(32),
  description: z.string().max(80).nullish(),
});
export type FormOrganization = z.infer<typeof formSchemaOrganization>;
