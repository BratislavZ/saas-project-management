import { z } from "zod";
import { organizationAdminValidationService } from "../services/organization-admin-validation.service";
import { organizationValidationService } from "../services/organization-validation.service";

const organizationAdminId = z.coerce
  .number()
  .int()
  .positive()
  .refine(
    async (organizationAdminId) =>
      await organizationAdminValidationService.organizationAdminExists(
        organizationAdminId
      ),
    {
      message: "Organization admin does not exist",
    }
  );

const organizationId = z.coerce
  .number()
  .int()
  .positive()
  .refine(
    async (organizationId) =>
      await organizationValidationService.organizationsExists(organizationId),
    {
      message: "Organization does not exist",
    }
  );

export const commonValidators = {
  organizationAdminId,
  organizationId,
};
