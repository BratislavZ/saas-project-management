import "server-only";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import { Organization } from "@/features/organizations/types/Organization";
import { buildURL } from "@/shared/utils/build-url";
import { Employee, EmployeeSchema } from "../types/Employee";

type Props = {
  organizationId: Organization["id"];
  includeBanned?: boolean;
};

export async function getAllEmployees({
  organizationId,
  includeBanned,
}: Props): Promise<Array<Pick<Employee, "id" | "name" | "user" | "email">>> {
  const { getToken } = await auth.protect();

  try {
    const token = await getToken();

    const response = await fetch(
      buildURL({
        basePath: `${process.env.API_URL}/api/organization/${organizationId}/employees`,
        queryParams: {
          includeBanned: includeBanned ? "true" : undefined,
        },
      }),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      await logBadResponse(response);
      throw new Error("Failed to get employees");
    }

    const data: unknown = await response.json();

    const validationSchema = z.array(
      EmployeeSchema.pick({ id: true, name: true, user: true, email: true })
    );
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
