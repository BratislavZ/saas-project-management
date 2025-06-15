import "server-only";
import { Organization, OrganizationSchema } from "../types/Organization";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { fromError } from "zod-validation-error";
import { z } from "zod";

export async function getAllOrganizations(): Promise<Array<Organization>> {
  const { getToken } = await auth.protect();

  try {
    const token = await getToken();

    const response = await fetch(`${process.env.API_URL}/api/organizations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await logBadResponse(response);
      throw new Error("Failed to get organizations");
    }

    const data: unknown = await response.json();

    const validationSchema = z.array(OrganizationSchema);
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
