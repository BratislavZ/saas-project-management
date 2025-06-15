import { z } from "zod";
import { USER_STATUSES } from "../../utils/types/UserStatus";
import { OrganizationSchema } from "@/features/organizations/types/Organization";
import { PROJECT_STATUSES } from "@/features/utils/types/ProjectStatus";

export const RoleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string(),
  organizationId: z.number().int().positive(),
  permissions: z
    .array(
      z.object({
        id: z.number().int().positive(),
        code: z.string(),
        group: z.string(),
        description: z.string(),
      })
    )
    .optional(),
});
export type Role = z.infer<typeof RoleSchema>;
