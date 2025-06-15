import { PermissionCode, PermissionGroup } from "@prisma/client";
import { z } from "zod";

export const PermissionDTOSchema = z.object({
  id: z.number().int().positive(),
  code: z.nativeEnum(PermissionCode),
  group: z.nativeEnum(PermissionGroup),
  description: z.string(),
});
export type PermissionDTO = z.infer<typeof PermissionDTOSchema>;
