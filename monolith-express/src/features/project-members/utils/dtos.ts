import { z } from "zod";
import { ProjectDTOSchema } from "../../projects/utils/dtos";
import { RoleDTOSchema } from "../../roles/utils/dtos";

export const ProjectMemberDTOSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  employee: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
  }),
  role: RoleDTOSchema.pick({
    id: true,
    name: true,
    permissions: true,
  }),
  project: ProjectDTOSchema.pick({
    id: true,
    name: true,
  }),
});
export type ProjectMemberDTO = z.infer<typeof ProjectMemberDTOSchema>;
