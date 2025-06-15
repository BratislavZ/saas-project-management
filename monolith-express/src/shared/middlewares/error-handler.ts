import { NextFunction, Request, Response } from "express";
import { CustomError } from "../errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { logger } from "../lib/logger";
import { ZodError } from "zod";
import { ValidationError } from "../errors/validation-error";
import { fromError } from "zod-validation-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(fromError(err));

  if (err instanceof CustomError) {
    res.status(err.statusCode).send({ errors: err.serializeErrors() });
    return;
  }

  // handle schema.parse errors
  if (err instanceof ZodError) {
    const validationError = new ValidationError(err);
    res
      .status(validationError.statusCode)
      .send({ errors: validationError.serializeErrors() });
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    errors: [{ message: "Something went wrong" }],
  });
};
