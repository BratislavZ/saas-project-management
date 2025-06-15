import { PermissionCode, PermissionGroup } from "@prisma/client";
import { z } from "zod";

export const RoleDTOSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable(),
  organizationId: z.number().int().positive(),
  permissions: z
    .array(
      z.object({
        id: z.number().int().positive(),
        code: z.nativeEnum(PermissionCode),
        group: z.nativeEnum(PermissionGroup),
        description: z.string(),
      })
    )
    .optional(),
});
export type RoleDTO = z.infer<typeof RoleDTOSchema>;
