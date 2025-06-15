import { Request } from "express";
import { z, ZodSchema } from "zod";
import { ValidationError } from "../errors/validation-error";

export const validateRequest = async <T extends ZodSchema>(
  schema: T,
  req: Request
): Promise<z.infer<T>> => {
  const result = await schema.safeParseAsync({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    throw new ValidationError(result.error);
  }

  return result.data;
};
