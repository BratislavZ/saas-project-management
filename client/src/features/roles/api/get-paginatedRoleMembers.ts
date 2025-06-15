import "server-only";
import { Paginated, paginateSchema } from "@/shared/types/Pagination";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { fromError } from "zod-validation-error";
import { buildURL } from "@/shared/utils/build-url";
import { GetRoleEmployeesSchema } from "../schemas/get-schemas";
import { Organization } from "@/features/organizations/types/Organization";
import { Role } from "../types/Role";
import { RoleMember, RoleMemberSchema } from "../types/RoleMember";

type Input = GetRoleEmployeesSchema & {
  organizationId: Organization["id"];
  roleId: Role["id"];
};

export async function getPaginatedRoleMembers(
  input: Input
): Promise<Paginated<RoleMember>> {
  const { getToken } = await auth.protect();

  try {
    const { pageNumber, pageSize, searchTerm, organizationId, roleId } = input;
    const token = await getToken();

    const response = await fetch(
      buildURL({
        basePath: `${process.env.API_URL}/api/organization/${organizationId}/role/${roleId}/members-paginated`,
        queryParams: {
          searchTerm,
          pageNumber,
          pageSize,
        },
      }),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      await logBadResponse(response);
      throw new Error("Failed to get members");
    }

    const data: unknown = await response.json();

    const validationSchema = paginateSchema(RoleMemberSchema);
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
