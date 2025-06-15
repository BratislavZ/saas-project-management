import { Organization } from "@/features/organizations/types/Organization";
import { NOT_FOUND_SERVER_ERROR } from "@/shared/lib/error";
import { logBadResponse } from "@/shared/utils/logger";
import { auth } from "@clerk/nextjs/server";
import "server-only";
import { fromError } from "zod-validation-error";
import { Role, RoleSchema } from "../types/Role";

type Props = {
  organizationId: Organization["id"];
  roleId: Role["id"];
};

export async function getRole({
  organizationId,
  roleId,
}: Props): Promise<Role> {
  const { getToken } = await auth.protect();

  try {
    const token = await getToken();

    const response = await fetch(
      `${process.env.API_URL}/api/organization/${organizationId}/role/${roleId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === NOT_FOUND_SERVER_ERROR.status) {
      throw NOT_FOUND_SERVER_ERROR;
    }

    if (!response.ok) {
      await logBadResponse(response);
      throw new Error("Failed to get role");
    }

    const data: unknown = await response.json();

    const validatedData = RoleSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
