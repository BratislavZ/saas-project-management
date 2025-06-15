import { z } from "zod";
import { ORGANIZATION_STATUSES } from "./OrganizationStatus";

export const OrganizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.enum(ORGANIZATION_STATUSES),
  description: z.string().nullish(),
});
export type Organization = z.infer<typeof OrganizationSchema>;
