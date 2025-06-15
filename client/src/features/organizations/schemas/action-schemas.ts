import { ServerError } from "@/shared/lib/error";
import { z } from "zod";
import { Organization } from "../types/Organization";

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(32),
  description: z.string().max(80).nullish(),
});
export type ActionInputCreateOrganization = z.infer<
  typeof CreateOrganizationSchema
>;
export type ActionOutputCreateOrganization = {
  error?: ServerError;
  organizationId?: Organization["id"];
};

export const EditOrganizationSchema = CreateOrganizationSchema.extend({
  organizationId: z.number().int().positive(),
});
export type ActionInputEditOrganization = z.infer<
  typeof EditOrganizationSchema
>;
export type ActionOutputEditOrganization = ActionOutputCreateOrganization;

export const BanOrganizationSchema = z.object({
  organizationId: z.number().int().positive(),
});
export type ActionInputBanOrganization = z.infer<typeof BanOrganizationSchema>;
export type ActionOutputBanOrganization = {
  error?: ServerError;
};

export const ActivateOrganizationSchema = z.object({
  organizationId: z.number().int().positive(),
});
export type ActionInputActivateOrganization = z.infer<
  typeof ActivateOrganizationSchema
>;
export type ActionOutputActivateOrganization = {
  error?: ServerError;
};
