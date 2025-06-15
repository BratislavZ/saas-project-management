"use server";

import { serverAction } from "@/shared/utils/server-action";
import {
  ActionInputCreateRole,
  ActionInputDeleteRole,
  ActionInputEditRole,
  ActionInputUpdateRolePermissions,
  ActionOutputCreateRole,
  ActionOutputDeleteRole,
  ActionOutputEditRole,
  ActionOutputUpdateRolePermissions,
  CreateRoleSchema,
  DeleteRoleSchema,
  EditRoleSchema,
  UpdateRolePermissionsSchema,
} from "./schemas/action-schemas";
import { revalidatePath } from "next/cache";
import { PATHS } from "@/shared/lib/paths";

export const createRoleAction = async (
  data: ActionInputCreateRole
): Promise<ActionOutputCreateRole> => {
  const response = await serverAction.execute(
    {
      method: "POST",
      endpoint: ({ organizationId }) =>
        `/api/organization/${organizationId}/role`,
      schema: CreateRoleSchema,
      transformResponse: (responseData) => ({
        roleId: responseData,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.roles(data.organizationId));

  return response.data;
};

export const editRoleAction = async (
  data: ActionInputEditRole
): Promise<ActionOutputEditRole> => {
  const response = await serverAction.execute(
    {
      method: "PATCH",
      endpoint: ({ organizationId, roleId }) =>
        `/api/organization/${organizationId}/role/${roleId}`,
      schema: EditRoleSchema,
      transformResponse: (responseData) => ({
        roleId: responseData,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.roles(data.organizationId));

  return response.data;
};

export const deleteRoleAction = async (
  data: ActionInputDeleteRole
): Promise<ActionOutputDeleteRole> => {
  const response = await serverAction.execute(
    {
      method: "DELETE",
      endpoint: ({ roleId, organizationId }) =>
        `/api/organization/${organizationId}/role/${roleId}`,
      schema: DeleteRoleSchema,
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.roles(data.organizationId));

  return {};
};

export const updateRolePermissionsAction = async (
  data: ActionInputUpdateRolePermissions
): Promise<ActionOutputUpdateRolePermissions> => {
  const response = await serverAction.execute(
    {
      method: "PATCH",
      endpoint: ({ organizationId, roleId }) =>
        `/api/organization/${organizationId}/role/${roleId}/permissions`,
      schema: UpdateRolePermissionsSchema,
      transformResponse: (responseData) => ({
        roleId: responseData,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  const { organizationId, roleId } = data;

  revalidatePath(
    PATHS.ORGANIZATION_ADMIN.roleIdPermissions(organizationId, roleId)
  );

  return response.data;
};
