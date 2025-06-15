import { z } from "zod";
import { USER_STATUSES } from "./UserStatus";

export const MeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  email: z.string().email(),
  status: z.enum(USER_STATUSES).optional(),
  organization: z
    .object({
      id: z.number().int().positive(),
      name: z.string(),
      status: z.enum(USER_STATUSES),
    })
    .optional(),
  isOrganizationAdmin: z.boolean().optional(),
  isSuperAdmin: z.boolean().optional(),
});
export type Me = z.infer<typeof MeSchema>;
