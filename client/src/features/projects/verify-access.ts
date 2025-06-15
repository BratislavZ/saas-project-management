import "server-only";

import { NOT_FOUND_SERVER_ERROR } from "@/shared/lib/error";
import { notFound } from "next/navigation";
import "server-only";
import { Organization } from "../organizations/types/Organization";
import { getSelfProjectMembership } from "../project-members/api/get-selfProjectMembership";
import { getMe } from "../utils/api/get-me";
import { getProject } from "./api/get-project";
import { Project } from "./types/Project";

type VerifyProjectIdAccessParams = {
  organizationId: Organization["id"];
  projectId: Project["id"];
};

export async function verifyProjectIdValid(
  params: VerifyProjectIdAccessParams
) {
  try {
    const project = await getProject(params);
    return { project };
  } catch (error) {
    if (error === NOT_FOUND_SERVER_ERROR) {
      notFound();
    }
    throw error;
  }
}

export async function verifyProjectAccess({
  organizationId,
  projectId,
}: {
  organizationId: Organization["id"];
  projectId: Project["id"];
}): Promise<{
  currentUser: Awaited<ReturnType<typeof getMe>>;
  projectMember?: Awaited<ReturnType<typeof getSelfProjectMembership>>;
}> {
  const currentUser = await getMe();

  const hasOrganizationAccess = currentUser.organization?.id === organizationId;

  if (!hasOrganizationAccess) {
    console.error(
      "🚫 Access denied: User does not have permission to access this resource."
    );
    notFound();
  }

  if (currentUser.isOrganizationAdmin) {
    return { currentUser };
  }

  try {
    const projectMember = await getSelfProjectMembership({
      organizationId,
      projectId,
    });

    return {
      currentUser,
      projectMember,
    };
  } catch (error) {
    if (error === NOT_FOUND_SERVER_ERROR) {
      console.error(
        "🚫 Access denied: User does not have permission to access this project."
      );
      notFound();
    }
    console.error("Error fetching self project membership:", error);
    throw error;
  }
}
