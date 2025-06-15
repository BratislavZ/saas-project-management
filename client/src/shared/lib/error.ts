export type ServerErrorCode =
  | "DEFAULT_SERVER_ERROR"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "SERVER_VALIDATION_ERROR";

export type ServerError = {
  code: ServerErrorCode;
  status?: number;
  details: string;
};

export const DEFAULT_SERVER_ERROR: ServerError = {
  code: "DEFAULT_SERVER_ERROR",
  status: 500,
  details: "Something went wrong.",
} as const;

export const FORBIDDEN_SERVER_ERROR: ServerError = {
  code: "FORBIDDEN",
  details: "Forbidden.",
  status: 403,
} as const;

export const NOT_FOUND_SERVER_ERROR: ServerError = {
  code: "NOT_FOUND",
  details: "Not found.",
  status: 404,
} as const;

export const SERVER_VALIDATION_ERROR = (details: string): ServerError => ({
  code: "SERVER_VALIDATION_ERROR",
  details,
  status: 400,
});
