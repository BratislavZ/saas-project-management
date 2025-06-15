import { EmployeeSchema } from "@/features/employees/types/Employee";
import { z } from "zod";

export const RoleMemberSchema = EmployeeSchema.pick({
  id: true,
  name: true,
  email: true,
});
export type RoleMember = z.infer<typeof RoleMemberSchema>;
