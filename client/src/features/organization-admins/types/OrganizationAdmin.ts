import { z } from "zod";
import { USER_STATUSES } from "../../utils/types/UserStatus";
import { OrganizationSchema } from "@/features/organizations/types/Organization";

export const OrganizationAdminSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  user: z.object({
    id: z.number().int().positive(),
    status: z.enum(USER_STATUSES),
  }),
  organization: OrganizationSchema.pick({
    id: true,
    name: true,
  }),
});
export type OrganizationAdmin = z.infer<typeof OrganizationAdminSchema>;
