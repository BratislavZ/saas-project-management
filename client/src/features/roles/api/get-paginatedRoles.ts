import "server-only";
import { Role, RoleSchema } from "../types/Role";
import { Paginated, paginateSchema } from "@/shared/types/Pagination";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { fromError } from "zod-validation-error";
import { buildURL } from "@/shared/utils/build-url";
import { GetRolesSchema } from "../schemas/get-schemas";

type Input = GetRolesSchema & {
  organizationId: number;
};

export async function getPaginatedRoles(
  input: Input
): Promise<Paginated<Role>> {
  const { getToken } = await auth.protect();

  try {
    const { pageNumber, pageSize, sort, searchTerm, organizationId } = input;
    const token = await getToken();

    const sortBy = sort?.[0].id;
    const sortDirection = sort?.[0].desc ? "desc" : undefined;

    const response = await fetch(
      buildURL({
        basePath: `${process.env.API_URL}/api/organization/${organizationId}/roles-paginated`,
        queryParams: {
          searchTerm,
          sortBy,
          sortDirection,
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
      throw new Error("Failed to get roles");
    }

    const data: unknown = await response.json();

    const validationSchema = paginateSchema(RoleSchema);
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
