import { OrganizationStatus } from "@prisma/client";
import { z } from "zod";

export const OrganizationDTOSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  status: z.nativeEnum(OrganizationStatus),
  description: z.string().nullable(),
});
export type OrganizationDTO = z.infer<typeof OrganizationDTOSchema>;
