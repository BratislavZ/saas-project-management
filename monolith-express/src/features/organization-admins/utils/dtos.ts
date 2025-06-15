import { UserStatus } from "@prisma/client";
import { z } from "zod";
import { OrganizationDTOSchema } from "../../organizations/utils/dtos";

export const OrganizationAdminDTOSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  email: z.string().email(),
  user: z
    .object({
      id: z.number().int().positive(),
      status: z.nativeEnum(UserStatus),
    })
    .nullable(),
  organization: OrganizationDTOSchema.pick({
    id: true,
    name: true,
  }),
});
export type OrganizationAdminDTO = z.infer<typeof OrganizationAdminDTOSchema>;
