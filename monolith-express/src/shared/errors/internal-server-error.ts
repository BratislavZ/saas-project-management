import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

export class InternalServerError extends CustomError {
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  constructor(errorMsg?: string) {
    super("Internal server error" + (errorMsg ? `: ${errorMsg}` : ""));
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
