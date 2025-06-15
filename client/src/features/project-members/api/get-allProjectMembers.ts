import "server-only";

import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import { Organization } from "@/features/organizations/types/Organization";
import { Project } from "@/features/projects/types/Project";
import { Employee, EmployeeSchema } from "@/features/employees/types/Employee";

type Props = {
  organizationId: Organization["id"];
  projectId: Project["id"];
};

export async function getAllProjectMembers({
  organizationId,
  projectId,
}: Props): Promise<Array<Pick<Employee, "id" | "name" | "email">>> {
  const { getToken } = await auth.protect();

  try {
    const token = await getToken();

    const response = await fetch(
      `${process.env.API_URL}/api/organization/${organizationId}/project/${projectId}/members`,
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

    const validationSchema = z.array(
      EmployeeSchema.pick({ id: true, name: true, email: true })
    );
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
