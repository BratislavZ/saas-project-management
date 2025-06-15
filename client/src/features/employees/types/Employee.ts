import { z } from "zod";
import { USER_STATUSES } from "../../utils/types/UserStatus";
import { OrganizationSchema } from "@/features/organizations/types/Organization";

export const EmployeeSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  user: z.object({
    id: z.number().int().positive(),
    status: z.enum(USER_STATUSES),
  }),
  organizationId: z.number().int().positive(),
  projects: z.array(
    z.object({
      id: z.number().int().positive(),
      name: z.string(),
    })
  ),
});
export type Employee = z.infer<typeof EmployeeSchema>;
