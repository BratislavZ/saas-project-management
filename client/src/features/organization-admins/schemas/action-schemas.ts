import { ServerError } from "@/shared/lib/error";
import { z } from "zod";
import { OrganizationAdmin } from "../types/OrganizationAdmin";

export const CreateOrganizationAdminSchema = z.object({
  name: z.string().min(1).max(32),
  email: z.string().email(),
  organizationId: z.number().int().positive(),
});
export type ActionInputCreateOrganizationAdmin = z.infer<
  typeof CreateOrganizationAdminSchema
>;
export type ActionOutputCreateOrganizationAdmin = {
  error?: ServerError;
  organizationAdminId?: OrganizationAdmin["id"];
};

export const EditOrganizationAdminSchema = z.object({
  name: z.string().min(1).max(32),
  organizationAdminId: z.number().int().positive(),
});
export type ActionInputEditOrganizationAdmin = z.infer<
  typeof EditOrganizationAdminSchema
>;
export type ActionOutputEditOrganizationAdmin =
  ActionOutputCreateOrganizationAdmin;

export const BanOrganizationAdminSchema = z.object({
  organizationAdminId: z.number().int().positive(),
});
export type ActionInputBanOrganizationAdmin = z.infer<
  typeof BanOrganizationAdminSchema
>;
export type ActionOutputBanOrganizationAdmin = {
  error?: ServerError;
};

export const ActivateOrganizationAdminSchema = z.object({
  organizationAdminId: z.number().int().positive(),
});
export type ActionInputActivateOrganizationAdmin = z.infer<
  typeof ActivateOrganizationAdminSchema
>;
export type ActionOutputActivateOrganizationAdmin = {
  error?: ServerError;
};
