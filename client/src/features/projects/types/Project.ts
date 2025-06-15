import { z } from "zod";
import { USER_STATUSES } from "../../utils/types/UserStatus";
import { OrganizationSchema } from "@/features/organizations/types/Organization";
import { PROJECT_STATUSES } from "@/features/utils/types/ProjectStatus";

export const ProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullish(),
  status: z.enum(PROJECT_STATUSES),
  organization: z.object({
    id: z.number(),
    name: z.string(),
  }),
  createdAt: z.string().datetime(),
});
export type Project = z.infer<typeof ProjectSchema>;
