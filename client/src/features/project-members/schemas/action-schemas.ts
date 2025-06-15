import { Employee } from "@/features/employees/types/Employee";
import { ServerError } from "@/shared/lib/error";
import { z } from "zod";

export const CreateProjectMemberSchema = z.object({
  organizationId: z.number().int().positive(),
  projectId: z.number().int().positive(),
  employeeId: z.number().int().positive(),
  roleId: z.number().int().positive(),
});
export type ActionInputCreateProjectMember = z.infer<
  typeof CreateProjectMemberSchema
>;
export type ActionOutputCreateProjectMember = {
  error?: ServerError;
  employeeId?: Employee["id"];
};

export const EditProjectMemberSchema = z.object({
  organizationId: z.number().int().positive(),
  projectId: z.number().int().positive(),
  memberId: z.number().int().positive(),
  roleId: z.number().int().positive(),
});
export type ActionInputEditProjectMember = z.infer<
  typeof EditProjectMemberSchema
>;
export type ActionOutputEditProjectMember = {
  error?: ServerError;
  memberId?: number;
};

export const RemoveProjectMemberSchema = z.object({
  organizationId: z.number().int().positive(),
  projectId: z.number().int().positive(),
  memberId: z.number().int().positive(),
});
export type ActionInputRemoveProjectMember = z.infer<
  typeof RemoveProjectMemberSchema
>;
export type ActionOutputRemoveProjectMember = {
  error?: ServerError;
};
