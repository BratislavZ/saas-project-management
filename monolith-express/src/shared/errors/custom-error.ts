import { StatusCodes } from "http-status-codes";

export abstract class CustomError extends Error {
  abstract statusCode: StatusCodes;
  abstract serializeErrors(): {
    message: string;
    field?: string;
    validationCode?: string;
  }[];

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
