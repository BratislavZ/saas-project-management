import "server-only";

import { Organization } from "@/features/organizations/types/Organization";
import { Project } from "@/features/projects/types/Project";
import { NOT_FOUND_SERVER_ERROR } from "@/shared/lib/error";
import { logBadResponse } from "@/shared/utils/logger";
import { auth } from "@clerk/nextjs/server";
import { fromError } from "zod-validation-error";
import { ProjectMember, ProjectMemberSchema } from "../types/ProjectMember";

type Props = {
  organizationId: Organization["id"];
  projectId: Project["id"];
};

export async function getSelfProjectMembership({
  organizationId,
  projectId,
}: Props): Promise<ProjectMember> {
  const { getToken } = await auth.protect();

  try {
    const token = await getToken();

    const response = await fetch(
      `${process.env.API_URL}/api/organization/${organizationId}/project/${projectId}/self/membership`,
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
      throw new Error("Failed to get membership");
    }

    const data: unknown = await response.json();

    const validatedData = ProjectMemberSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
