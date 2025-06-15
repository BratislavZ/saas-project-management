"use server";

import { serverAction } from "@/shared/utils/server-action";
import { revalidatePath } from "next/cache";
import { PATHS } from "@/shared/lib/paths";
import {
  ActionInputActivateEmployee,
  ActionInputBanEmployee,
  ActionInputCreateEmployee,
  ActionInputEditEmployee,
  ActionOutputActivateEmployee,
  ActionOutputBanEmployee,
  ActionOutputCreateEmployee,
  ActionOutputEditEmployee,
  ActivateEmployeeSchema,
  BanEmployeeSchema,
  CreateEmployeeSchema,
  EditEmployeeSchema,
} from "./schemas/action-schemas";

export const createEmployeeAction = async (
  data: ActionInputCreateEmployee
): Promise<ActionOutputCreateEmployee> => {
  const response = await serverAction.execute(
    {
      method: "POST",
      endpoint: ({ organizationId }) =>
        `/api/organization/${organizationId}/employee`,
      schema: CreateEmployeeSchema,
      transformResponse: (responseData) => ({
        employeeId: responseData,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.employees(data.organizationId));

  return response.data;
};

export const editEmployeeAction = async (
  data: ActionInputEditEmployee
): Promise<ActionOutputEditEmployee> => {
  const response = await serverAction.execute(
    {
      method: "PATCH",
      endpoint: ({ organizationId, employeeId }) =>
        `/api/organization/${organizationId}/employee/${employeeId}`,
      schema: EditEmployeeSchema,
      transformResponse: (responseData) => ({
        employeeId: responseData,
      }),
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.employees(data.organizationId));

  return response.data;
};

export const banEmployeeAction = async (
  data: ActionInputBanEmployee
): Promise<ActionOutputBanEmployee> => {
  const response = await serverAction.execute(
    {
      method: "DELETE",
      endpoint: ({ employeeId, organizationId }) =>
        `/api/organization/${organizationId}/employee/${employeeId}/ban`,
      schema: BanEmployeeSchema,
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.employees(data.organizationId));

  return {};
};

export const activateEmployeeAction = async (
  data: ActionInputActivateEmployee
): Promise<ActionOutputActivateEmployee> => {
  const response = await serverAction.execute(
    {
      method: "PATCH",
      endpoint: ({ organizationId, employeeId }) =>
        `/api/organization/${organizationId}/employee/${employeeId}/activate`,
      schema: ActivateEmployeeSchema,
    },
    data
  );

  if (response.error) {
    return { error: response.error };
  }

  revalidatePath(PATHS.ORGANIZATION_ADMIN.employees(data.organizationId));

  return {};
};
