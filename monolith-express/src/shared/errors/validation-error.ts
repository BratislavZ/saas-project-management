import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

export class ValidationError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;

  constructor(public zodError: ZodError) {
    super("Validation error");
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  serializeErrors() {
    return this.zodError.errors.map((err) => {
      return {
        message: err.message,
        field: err.path.join("."),
      };
    });
  }
}
