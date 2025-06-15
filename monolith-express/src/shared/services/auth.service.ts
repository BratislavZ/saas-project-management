import { clerkClient } from "@clerk/express";
import { logger } from "../lib/logger";

const createClerkUser = async (
  email: string
): Promise<{
  id: string;
} | null> => {
  try {
    const newClerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      skipPasswordRequirement: true,
    });

    if (!newClerkUser) {
      logger.error("Failed to create Clerk user, external service error");
      throw new Error();
    }

    return { id: newClerkUser.id };
  } catch (error) {
    logger.error("Failed to create Clerk user", error);
    return null;
  }
};

export const authService = {
  createClerkUser,
};
