"use server";

import { serverAction } from "@/shared/utils/server-action";
import {
  ActionInputCreateProjectMember,
  ActionInputEditProjectMember,
  ActionInputRemoveProjectMember,
  ActionOutputCreateProjectMember,
  ActionOutputEditProjectMember,
  ActionOutputRemoveProjectMember,
  CreateProjectMemberSchema,
  EditProjectMemberSchema,
  RemoveProjectMemberSchema,
} from "./schemas/action-schemas";
import { revalidatePath } from "next/cache";
import { PATHS } from "@/shared/lib/paths";

export const createProjectMemberAction = async (
  data: ActionInputCreateProjectMember
): Promise<ActionOutputCreateProjectMember> => {
  const response = await serverAction.execute(
    {
      method: "POST",
      endpoint: ({ organizationId, projectId }) =>
        `/api/organization/${organizationId}/project/${projectId}/member`,
      schema: CreateProjectMemberSchema,
      transformResponse: (responseData) => ({
        employeeId: responseData.employeeId,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.projects(data.organizationId));
  revalidatePath(PATHS.ORGANIZATION_ADMIN.employees(data.organizationId));
  revalidatePath(
    PATHS.EMPLOYEE.projectIdSettings.members(
      data.organizationId,
      data.projectId
    )
  );

  return response.data;
};

export const editProjectMemberAction = async (
  data: ActionInputEditProjectMember
): Promise<ActionOutputEditProjectMember> => {
  const response = await serverAction.execute(
    {
      method: "PATCH",
      endpoint: ({ organizationId, projectId, memberId }) =>
        `/api/organization/${organizationId}/project/${projectId}/member/${memberId}`,
      schema: EditProjectMemberSchema,
      transformResponse: (responseData) => ({
        memberId: responseData.memberId,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.projects(data.organizationId));
  revalidatePath(PATHS.ORGANIZATION_ADMIN.employees(data.organizationId));
  revalidatePath(
    PATHS.EMPLOYEE.projectIdSettings.members(
      data.organizationId,
      data.projectId
    )
  );

  return response.data;
};

export const removeProjectMemberAction = async (
  data: ActionInputRemoveProjectMember
): Promise<ActionOutputRemoveProjectMember> => {
  const response = await serverAction.execute(
    {
      method: "DELETE",
      endpoint: ({ organizationId, projectId, memberId }) =>
        `/api/organization/${organizationId}/project/${projectId}/member/${memberId}`,
      schema: RemoveProjectMemberSchema,
      transformResponse: () => ({}),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.projects(data.organizationId));
  revalidatePath(PATHS.ORGANIZATION_ADMIN.employees(data.organizationId));
  revalidatePath(
    PATHS.EMPLOYEE.projectIdSettings.members(
      data.organizationId,
      data.projectId
    )
  );

  return response.data;
};
