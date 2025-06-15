"use server";

import { serverAction } from "@/shared/utils/server-action";
import {
  ActionInputActivateProject,
  ActionInputArchiveProject,
  ActionInputCreateProject,
  ActionInputEditProject,
  ActionOutputActivateProject,
  ActionOutputArchiveProject,
  ActionOutputCreateProject,
  ActionOutputEditProject,
  ActivateProjectSchema,
  ArchiveProjectSchema,
  CreateProjectSchema,
  EditProjectSchema,
} from "./schemas/action-schemas";
import { revalidatePath } from "next/cache";
import { PATHS } from "@/shared/lib/paths";

export const createProjectAction = async (
  data: ActionInputCreateProject
): Promise<ActionOutputCreateProject> => {
  const response = await serverAction.execute(
    {
      method: "POST",
      endpoint: ({ organizationId }) =>
        `/api/organization/${organizationId}/project`,
      schema: CreateProjectSchema,
      transformResponse: (responseData) => ({
        projectId: responseData,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.projects(data.organizationId));

  return response.data;
};

export const editProjectAction = async (
  data: ActionInputEditProject
): Promise<ActionOutputEditProject> => {
  const response = await serverAction.execute(
    {
      method: "PATCH",
      endpoint: ({ organizationId, projectId }) =>
        `/api/organization/${organizationId}/project/${projectId}`,
      schema: EditProjectSchema,
      transformResponse: (responseData) => ({
        projectId: responseData,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.projects(data.organizationId));

  return response.data;
};

export const archiveProjectAction = async (
  data: ActionInputArchiveProject
): Promise<ActionOutputArchiveProject> => {
  const response = await serverAction.execute(
    {
      method: "DELETE",
      endpoint: ({ projectId, organizationId }) =>
        `/api/organization/${organizationId}/project/${projectId}/archive`,
      schema: ArchiveProjectSchema,
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.projects(data.organizationId));

  return {};
};

export const activateProjectAction = async (
  data: ActionInputActivateProject
): Promise<ActionOutputActivateProject> => {
  const response = await serverAction.execute(
    {
      method: "PATCH",
      endpoint: ({ projectId, organizationId }) =>
        `/api/organization/${organizationId}/project/${projectId}/activate`,
      schema: ActivateProjectSchema,
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.projects(data.organizationId));

  return {};
};
