import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

export const ProjectDTOSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.nativeEnum(ProjectStatus),
  organization: z.object({
    id: z.number().int().positive(),
    name: z.string(),
  }),
  createdAt: z.date(),
});
export type ProjectDTO = z.infer<typeof ProjectDTOSchema>;

export const SelfProjectDTOSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  role: z.object({
    id: z.number(),
    name: z.string(),
  }),
  createdAt: z.date(),
});
export type SelfProjectDTO = z.infer<typeof SelfProjectDTOSchema>;
