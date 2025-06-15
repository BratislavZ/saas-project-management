"use server";

import { serverAction } from "@/shared/utils/server-action";
import {
  ActionInputActivateOrganization,
  ActionInputBanOrganization,
  ActionInputCreateOrganization,
  ActionInputEditOrganization,
  ActionOutputActivateOrganization,
  ActionOutputBanOrganization,
  ActionOutputCreateOrganization,
  ActionOutputEditOrganization,
  ActivateOrganizationSchema,
  BanOrganizationSchema,
  CreateOrganizationSchema,
  EditOrganizationSchema,
} from "./schemas/action-schemas";
import { revalidatePath } from "next/cache";
import { PATHS } from "@/shared/lib/paths";

export const createOrganizationAction = async (
  data: ActionInputCreateOrganization
): Promise<ActionOutputCreateOrganization> => {
  const response = await serverAction.execute(
    {
      method: "POST",
      endpoint: "/api/organization",
      schema: CreateOrganizationSchema,
      transformResponse: (responseData) => ({
        organizationId: responseData,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.SUPER_ADMIN.organizations);

  return response.data;
};

export const editOrganizationAction = async (
  data: ActionInputEditOrganization
): Promise<ActionOutputEditOrganization> => {
  const response = await serverAction.execute(
    {
      method: "PATCH",
      endpoint: ({ organizationId }) => `/api/organization/${organizationId}`,
      schema: EditOrganizationSchema,
      transformResponse: (responseData) => ({
        organizationId: responseData,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.SUPER_ADMIN.organizations);

  return response.data;
};

export const banOrganizationAction = async (
  data: ActionInputBanOrganization
): Promise<ActionOutputBanOrganization> => {
  const response = await serverAction.execute(
    {
      method: "DELETE",
      endpoint: ({ organizationId }) =>
        `/api/organization/${organizationId}/ban`,
      schema: BanOrganizationSchema,
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.SUPER_ADMIN.organizations);

  return {};
};

export const activateOrganizationAction = async (
  data: ActionInputActivateOrganization
): Promise<ActionOutputActivateOrganization> => {
  const response = await serverAction.execute(
    {
      method: "PATCH",
      endpoint: ({ organizationId }) =>
        `/api/organization/${organizationId}/activate`,
      schema: ActivateOrganizationSchema,
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.SUPER_ADMIN.organizations);

  return {};
};
