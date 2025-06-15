import { CustomError } from "./custom-error";

export class NotAuthenticatedError extends CustomError {
  statusCode = 401;

  constructor() {
    super("Not signed in or invalid token");
    Object.setPrototypeOf(this, NotAuthenticatedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
