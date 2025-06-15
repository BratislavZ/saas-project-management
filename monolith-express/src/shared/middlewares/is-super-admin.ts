import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors/forbidden-error";

export const isSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser = req.currentUser;

  if (currentUser.superAdmin) {
    next();
    return;
  }

  throw new ForbiddenError("User");
};
