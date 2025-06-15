import { EmployeeSchema } from "@/features/employees/types/Employee";
import { ProjectSchema } from "@/features/projects/types/Project";
import { RoleSchema } from "@/features/roles/types/Role";
import { z } from "zod";

export const ProjectMemberSchema = z.object({
  id: z.number(),
  createdAt: z.string().datetime(),
  employee: EmployeeSchema.pick({
    id: true,
    name: true,
    email: true,
  }),
  role: RoleSchema.pick({
    id: true,
    name: true,
    permissions: true,
  }),
  project: ProjectSchema.pick({
    id: true,
    name: true,
  }),
});
export type ProjectMember = z.infer<typeof ProjectMemberSchema>;
