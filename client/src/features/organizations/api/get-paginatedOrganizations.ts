import "server-only";
import { Organization, OrganizationSchema } from "../types/Organization";
import { Paginated, paginateSchema } from "@/shared/types/Pagination";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { GetOrganizationsSchema } from "../schemas/get-schemas";
import { fromError } from "zod-validation-error";
import { buildURL } from "@/shared/utils/build-url";

export async function getPaginatedOrganizations(
  input: GetOrganizationsSchema
): Promise<Paginated<Organization>> {
  const { getToken } = await auth.protect();

  try {
    const { pageNumber, pageSize, sort, searchTerm, status } = input;
    const token = await getToken();

    const sortBy = sort?.[0].id;
    const sortDirection = sort?.[0].desc ? "desc" : undefined;

    const response = await fetch(
      buildURL({
        basePath: `${process.env.API_URL}/api/organizations-paginated`,
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
      throw new Error("Failed to get organizations");
    }

    const data: unknown = await response.json();

    const validationSchema = paginateSchema(OrganizationSchema);
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
