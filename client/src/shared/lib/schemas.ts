import { z } from "zod";

const IDValidator = z.coerce
  .number({ invalid_type_error: "Required" })
  .int()
  .positive();

export const CommonValidators = {
  IDValidator,
};
