import { ServerError } from "@/shared/lib/error";
import { z } from "zod";
import { Employee } from "../types/Employee";

export const CreateEmployeeSchema = z.object({
  name: z.string().min(1).max(32),
  email: z.string().email(),
  organizationId: z.number().int().positive(),
});
export type ActionInputCreateEmployee = z.infer<typeof CreateEmployeeSchema>;
export type ActionOutputCreateEmployee = {
  error?: ServerError;
  employeeId?: Employee["id"];
};

export const EditEmployeeSchema = z.object({
  name: z.string().min(1).max(32),
  organizationId: z.number().int().positive(),
  employeeId: z.number().int().positive(),
});
export type ActionInputEditEmployee = z.infer<typeof EditEmployeeSchema>;
export type ActionOutputEditEmployee = ActionOutputCreateEmployee;

export const BanEmployeeSchema = z.object({
  organizationId: z.number().int().positive(),
  employeeId: z.number().int().positive(),
});
export type ActionInputBanEmployee = z.infer<typeof BanEmployeeSchema>;
export type ActionOutputBanEmployee = {
  error?: ServerError;
};

export const ActivateEmployeeSchema = z.object({
  organizationId: z.number().int().positive(),
  employeeId: z.number().int().positive(),
});
export type ActionInputActivateEmployee = z.infer<
  typeof ActivateEmployeeSchema
>;
export type ActionOutputActivateEmployee = {
  error?: ServerError;
};
