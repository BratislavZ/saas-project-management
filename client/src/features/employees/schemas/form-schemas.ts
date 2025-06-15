import { CommonValidators } from "@/shared/lib/schemas";
import { z } from "zod";

export const formSchemaEmployee = z.object({
  name: z.string().min(1).max(32),
  email: z.string().email(),
});
export type FormEmployee = z.infer<typeof formSchemaEmployee>;

export const formSchemaEmployeeToProject = z.object({
  projectId: CommonValidators.IDValidator,
  roleId: CommonValidators.IDValidator,
});
export type FormEmployeeToProject = z.infer<typeof formSchemaEmployeeToProject>;
