import { NextFunction, Request, Response } from "express";
import { NotAuthenticatedError } from "../errors/not-authenticated-error";
import { prisma } from "../lib/prisma";
import { ForbiddenError } from "../errors/forbidden-error";

export const attachAuthenticatedUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clerkUserId = req.auth?.userId;

  if (!clerkUserId) {
    throw new NotAuthenticatedError();
  }

  const user = await prisma.user.findFirst({
    where: {
      clerkUserId,
      status: "ACTIVE",
    },
    include: {
      superAdmin: true,
      organizationAdmin: { include: { organization: true } },
      employee: { include: { organization: true } },
    },
  });

  if (!user) {
    throw new ForbiddenError("Current user");
  }

  req.currentUser = user;

  next();
};
