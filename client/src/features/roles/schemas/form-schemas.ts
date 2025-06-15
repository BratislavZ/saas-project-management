import { z } from "zod";

export const formSchemaRole = z.object({
  name: z.string().min(1).max(32),
  description: z.string().min(1).max(256),
});
export type FormRole = z.infer<typeof formSchemaRole>;

export const formSchemaRolePermissions = z.object({
  permissionIds: z.array(z.number().int().positive()),
});
export type FormRolePermissions = z.infer<typeof formSchemaRolePermissions>;
