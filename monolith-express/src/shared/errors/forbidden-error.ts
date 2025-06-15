import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

export class ForbiddenError extends CustomError {
  statusCode = StatusCodes.FORBIDDEN;

  constructor(public resource: string = "Resource") {
    super(`Access to ${resource} forbidden`);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
