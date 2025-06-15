import { UserStatus } from "@prisma/client";
import { z } from "zod";

export const EmployeeDTOSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  user: z
    .object({
      id: z.number().int().positive(),
      status: z.nativeEnum(UserStatus),
    })
    .nullable(),
  email: z.string().email(),
  organizationId: z.number().int().positive(),
  projects: z.array(
    z.object({
      id: z.number().int().positive(),
      name: z.string(),
    })
  ),
});
export type EmployeeDTO = z.infer<typeof EmployeeDTOSchema>;
