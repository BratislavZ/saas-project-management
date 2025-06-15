import "server-only";
import {
  OrganizationAdmin,
  OrganizationAdminSchema,
} from "../types/OrganizationAdmin";
import { Paginated, paginateSchema } from "@/shared/types/Pagination";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { GetOrganizationAdminsSchema } from "../schemas/get-schemas";
import { fromError } from "zod-validation-error";
import { buildURL } from "@/shared/utils/build-url";

export async function getPaginatedOrganizationAdmins(
  input: GetOrganizationAdminsSchema
): Promise<Paginated<OrganizationAdmin>> {
  const { getToken } = await auth.protect();

  try {
    const { pageNumber, pageSize, sort, searchTerm, status } = input;
    const token = await getToken();

    const sortBy = sort?.[0].id;
    const sortDirection = sort?.[0].desc ? "desc" : undefined;

    const response = await fetch(
      buildURL({
        basePath: `${process.env.API_URL}/api/organization-admins-paginated`,
        queryParams: {
          searchTerm,
          sortBy,
          sortDirection,
          status: status[0],
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
      throw new Error("Failed to get organization admins");
    }

    const data: unknown = await response.json();

    const validationSchema = paginateSchema(OrganizationAdminSchema);
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
