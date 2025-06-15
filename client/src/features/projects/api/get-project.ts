import { Organization } from "@/features/organizations/types/Organization";
import { NOT_FOUND_SERVER_ERROR } from "@/shared/lib/error";
import { logBadResponse } from "@/shared/utils/logger";
import { auth } from "@clerk/nextjs/server";
import "server-only";
import { fromError } from "zod-validation-error";
import { Project, ProjectSchema } from "../types/Project";

type Props = {
  organizationId: Organization["id"];
  projectId: Project["id"];
};

export async function getProject({
  organizationId,
  projectId,
}: Props): Promise<Project> {
  const { getToken } = await auth.protect();

  try {
    const token = await getToken();

    const response = await fetch(
      `${process.env.API_URL}/api/organization/${organizationId}/project/${projectId}`,
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
      throw new Error("Failed to get project");
    }

    const data: unknown = await response.json();

    const validatedData = ProjectSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
