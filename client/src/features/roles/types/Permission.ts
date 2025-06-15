import { z } from "zod";

export const PERMISSION_CODES = [
  // project permissions
  "PROJECT_UPDATE",
  "PROJECT_ARCHIVE",
  "PROJECT_ACTIVATE",
  "PROJECT_DELETE",

  // project member permissions
  "PROJECT_MEMBER_VIEW",
  "PROJECT_MEMBER_ADD",
  "PROJECT_MEMBER_REMOVE",
  "PROJECT_MEMBER_ROLE_UPDATE",

  // ticket permissions
  "TICKET_CREATE",
  "TICKET_UPDATE",
  "TICKET_DELETE",
  "TICKET_REORDER",

  // ticket column permissions
  "TICKET_COLUMN_CREATE",
  "TICKET_COLUMN_UPDATE",
  "TICKET_COLUMN_DELETE",
  "TICKET_COLUMN_REORDER",
] as const;

export const PERMISSION_GROUPS = [
  "PROJECT",
  "TICKET",
  "TICKET_COLUMN",
  "PROJECT_MEMBER",
] as const;
export type PermissionGroup = (typeof PERMISSION_GROUPS)[number];

export const PermissionSchema = z.object({
  id: z.number(),
  code: z.enum(PERMISSION_CODES),
  group: z.enum(PERMISSION_GROUPS),
  description: z.string(),
});
export type Permission = z.infer<typeof PermissionSchema>;
