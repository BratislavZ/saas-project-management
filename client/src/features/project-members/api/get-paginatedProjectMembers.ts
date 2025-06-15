import "server-only";
import { Paginated, paginateSchema } from "@/shared/types/Pagination";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { fromError } from "zod-validation-error";
import { buildURL } from "@/shared/utils/build-url";
import { Organization } from "@/features/organizations/types/Organization";
import { Project } from "@/features/projects/types/Project";
import { ProjectMember, ProjectMemberSchema } from "../types/ProjectMember";
import { GetProjectMembersSchema } from "../schemas/get-schemas";

type Input = GetProjectMembersSchema & {
  organizationId: Organization["id"];
  projectId: Project["id"];
};

export async function getPaginatedProjectMembers(
  input: Input
): Promise<Paginated<ProjectMember>> {
  const { getToken } = await auth.protect();

  try {
    const {
      pageNumber,
      pageSize,
      sort,
      searchTerm,
      role,
      projectId,
      organizationId,
    } = input;
    const token = await getToken();

    const sortBy = sort?.[0].id;
    const sortDirection = sort?.[0].desc ? "desc" : undefined;

    const response = await fetch(
      buildURL({
        basePath: `${process.env.API_URL}/api/organization/${organizationId}/project/${projectId}/members-paginated`,
        queryParams: {
          searchTerm,
          sortBy,
          sortDirection,
          role,
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

    const validationSchema = paginateSchema(ProjectMemberSchema);
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
