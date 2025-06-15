import "server-only";
import { Project, ProjectSchema } from "../types/Project";
import { Paginated, paginateSchema } from "@/shared/types/Pagination";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { fromError } from "zod-validation-error";
import { buildURL } from "@/shared/utils/build-url";
import { GetProjectsSchema } from "../schemas/get-schemas";

type Input = GetProjectsSchema & {
  organizationId: number;
};

export async function getPaginatedProjects(
  input: Input
): Promise<Paginated<Project>> {
  const { getToken } = await auth.protect();

  try {
    const { pageNumber, pageSize, sort, searchTerm, status, organizationId } =
      input;
    const token = await getToken();

    const sortBy = sort?.[0].id;
    const sortDirection = sort?.[0].desc ? "desc" : undefined;

    const response = await fetch(
      buildURL({
        basePath: `${process.env.API_URL}/api/organization/${organizationId}/projects-paginated`,
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
      throw new Error("Failed to get projects");
    }

    const data: unknown = await response.json();

    const validationSchema = paginateSchema(ProjectSchema);
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
