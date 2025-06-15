import "server-only";

import { Me, MeSchema } from "../types/Me";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { FORBIDDEN_SERVER_ERROR } from "@/shared/lib/error";
import { redirect } from "next/navigation";
import { PATHS } from "@/shared/lib/paths";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function getMe(): Promise<Me> {
  try {
    const { getToken } = await auth.protect();

    const token = await getToken();

    const response = await fetch(`${process.env.API_URL}/api/utils/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.status === FORBIDDEN_SERVER_ERROR.status) {
      throw FORBIDDEN_SERVER_ERROR;
    }

    if (!response.ok) {
      await logBadResponse(response);
    }

    const data = await response.json();
    const validatedData = MeSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(error);
    if (error === FORBIDDEN_SERVER_ERROR) {
      console.error(
        "🚫 Access denied: User does not have permission to access this resource."
      );
      redirect(PATHS.OTHER.accessDenied);
    }

    console.error(
      "🚨 An error occurred while getting Me, trying to logout:",
      error
    );
    redirect(PATHS.OTHER.logout);
  }
}
