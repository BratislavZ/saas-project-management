import "server-only";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import { Role, RoleSchema } from "../types/Role";
import { Organization } from "@/features/organizations/types/Organization";
import { buildURL } from "@/shared/utils/build-url";

type Props = {
  organizationId: Organization["id"];
};

export async function getAllSelfRoles({
  organizationId,
}: Props): Promise<Array<Pick<Role, "id" | "name">>> {
  const { getToken } = await auth.protect();

  try {
    const token = await getToken();

    const response = await fetch(
      `${process.env.API_URL}/api/organization/${organizationId}/self/roles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      await logBadResponse(response);
      throw new Error("Failed to get roles");
    }

    const data: unknown = await response.json();

    const validationSchema = z.array(RoleSchema.pick({ id: true, name: true }));
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
