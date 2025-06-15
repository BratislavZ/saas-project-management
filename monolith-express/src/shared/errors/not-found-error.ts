import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

export class NotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;

  constructor(public resource: string = "Resource") {
    super(`${resource} not found`);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
