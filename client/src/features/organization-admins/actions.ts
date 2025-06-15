"use server";

import { serverAction } from "@/shared/utils/server-action";
import {
  ActionInputActivateOrganizationAdmin,
  ActionInputBanOrganizationAdmin,
  ActionInputCreateOrganizationAdmin,
  ActionInputEditOrganizationAdmin,
  ActionOutputActivateOrganizationAdmin,
  ActionOutputBanOrganizationAdmin,
  ActionOutputCreateOrganizationAdmin,
  ActionOutputEditOrganizationAdmin,
  ActivateOrganizationAdminSchema,
  BanOrganizationAdminSchema,
  CreateOrganizationAdminSchema,
  EditOrganizationAdminSchema,
} from "./schemas/action-schemas";
import { revalidatePath } from "next/cache";
import { PATHS } from "@/shared/lib/paths";

export const createOrganizationAdminAction = async (
  data: ActionInputCreateOrganizationAdmin
): Promise<ActionOutputCreateOrganizationAdmin> => {
  const response = await serverAction.execute(
    {
      method: "POST",
      endpoint: "/api/organization-admin",
      schema: CreateOrganizationAdminSchema,
      transformResponse: (responseData) => ({
        organizationAdminId: responseData,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.SUPER_ADMIN.admins);

  return response.data;
};

export const editOrganizationAdminAction = async (
  data: ActionInputEditOrganizationAdmin
): Promise<ActionOutputEditOrganizationAdmin> => {
  const response = await serverAction.execute(
    {
      method: "PATCH",
      endpoint: ({ organizationAdminId }) =>
        `/api/organization-admin/${organizationAdminId}`,
      schema: EditOrganizationAdminSchema,
      transformResponse: (responseData) => ({
        organizationAdminId: responseData,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.SUPER_ADMIN.admins);

  return response.data;
};

export const banOrganizationAdminAction = async (
  data: ActionInputBanOrganizationAdmin
): Promise<ActionOutputBanOrganizationAdmin> => {
  const response = await serverAction.execute(
    {
      method: "DELETE",
      endpoint: ({ organizationAdminId }) =>
        `/api/organization-admin/${organizationAdminId}/ban`,
      schema: BanOrganizationAdminSchema,
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.SUPER_ADMIN.admins);

  return {};
};

export const activateOrganizationAdminAction = async (
  data: ActionInputActivateOrganizationAdmin
): Promise<ActionOutputActivateOrganizationAdmin> => {
  const response = await serverAction.execute(
    {
      method: "PATCH",
      endpoint: ({ organizationAdminId }) =>
        `/api/organization-admin/${organizationAdminId}/activate`,
      schema: ActivateOrganizationAdminSchema,
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.SUPER_ADMIN.admins);

  return {};
};
