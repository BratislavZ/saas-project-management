import { ServerError } from "@/shared/lib/error";
import { z } from "zod";
import { Role } from "../types/Role";

export const CreateRoleSchema = z.object({
  name: z.string().min(1).max(32),
  description: z.string().max(256).optional(),
  organizationId: z.number().int().positive(),
});
export type ActionInputCreateRole = z.infer<typeof CreateRoleSchema>;
export type ActionOutputCreateRole = {
  error?: ServerError;
  roleId?: Role["id"];
};

export const EditRoleSchema = z.object({
  name: z.string().min(1).max(32),
  description: z.string().max(256).optional(),
  organizationId: z.number().int().positive(),
  roleId: z.number().int().positive(),
});
export type ActionInputEditRole = z.infer<typeof EditRoleSchema>;
export type ActionOutputEditRole = ActionOutputCreateRole;

export const DeleteRoleSchema = z.object({
  organizationId: z.number().int().positive(),
  roleId: z.number().int().positive(),
});
export type ActionInputDeleteRole = z.infer<typeof DeleteRoleSchema>;
export type ActionOutputDeleteRole = {
  error?: ServerError;
};

export const UpdateRolePermissionsSchema = z.object({
  organizationId: z.number().int().positive(),
  roleId: z.number().int().positive(),
  permissionIds: z.array(z.number().int().positive()),
});
export type ActionInputUpdateRolePermissions = z.infer<
  typeof UpdateRolePermissionsSchema
>;
export type ActionOutputUpdateRolePermissions = {
  error?: ServerError;
  roleId?: Role["id"];
};
