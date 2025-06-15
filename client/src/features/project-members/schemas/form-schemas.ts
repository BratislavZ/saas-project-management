import { CommonValidators } from "@/shared/lib/schemas";
import { z } from "zod";

export const formSchemaProjectMember = z.object({
  employeeId: CommonValidators.IDValidator,
  roleId: CommonValidators.IDValidator,
});
export type FormProjectMember = z.infer<typeof formSchemaProjectMember>;
