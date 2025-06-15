import { ServerError } from "@/shared/lib/error";
import { z } from "zod";
import { Project } from "../types/Project";

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(32),
  description: z.string().max(256).optional(),
  organizationId: z.number().int().positive(),
});
export type ActionInputCreateProject = z.infer<typeof CreateProjectSchema>;
export type ActionOutputCreateProject = {
  error?: ServerError;
  projectId?: Project["id"];
};

export const EditProjectSchema = z.object({
  name: z.string().min(1).max(32),
  description: z.string().max(256).optional(),
  organizationId: z.number().int().positive(),
  projectId: z.number().int().positive(),
});
export type ActionInputEditProject = z.infer<typeof EditProjectSchema>;
export type ActionOutputEditProject = ActionOutputCreateProject;

export const ArchiveProjectSchema = z.object({
  organizationId: z.number().int().positive(),
  projectId: z.number().int().positive(),
});
export type ActionInputArchiveProject = z.infer<typeof ArchiveProjectSchema>;
export type ActionOutputArchiveProject = {
  error?: ServerError;
};

export const ActivateProjectSchema = z.object({
  organizationId: z.number().int().positive(),
  projectId: z.number().int().positive(),
});
export type ActionInputActivateProject = z.infer<typeof ActivateProjectSchema>;
export type ActionOutputActivateProject = {
  error?: ServerError;
};
