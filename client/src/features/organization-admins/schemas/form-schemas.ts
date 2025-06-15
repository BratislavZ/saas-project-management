import { z } from "zod";

export const formSchemaOrganizationAdmin = z.object({
  name: z.string().min(1).max(32),
  email: z.string().email(),
  organizationId: z.coerce.number().int().positive(),
});
export type FormOrganizationAdmin = z.infer<typeof formSchemaOrganizationAdmin>;
