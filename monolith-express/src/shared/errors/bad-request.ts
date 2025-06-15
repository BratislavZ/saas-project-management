import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

export class BadRequestError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;

  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
