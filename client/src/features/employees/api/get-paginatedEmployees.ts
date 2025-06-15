import "server-only";
import { Employee, EmployeeSchema } from "../types/Employee";
import { Paginated, paginateSchema } from "@/shared/types/Pagination";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { GetEmployeesSchema as GetEmployeesSchema } from "../schemas/get-schemas";
import { fromError } from "zod-validation-error";
import { buildURL } from "@/shared/utils/build-url";

type Input = GetEmployeesSchema & {
  organizationId: number;
};

export async function getPaginatedEmployees(
  input: Input
): Promise<Paginated<Employee>> {
  const { getToken } = await auth.protect();

  try {
    const {
      pageNumber,
      pageSize,
      sort,
      searchTerm,
      status,
      projectId,
      organizationId,
    } = input;
    const token = await getToken();

    const sortBy = sort?.[0].id;
    const sortDirection = sort?.[0].desc ? "desc" : undefined;

    const response = await fetch(
      buildURL({
        basePath: `${process.env.API_URL}/api/organization/${organizationId}/employees-paginated`,
        queryParams: {
          searchTerm,
          sortBy,
          sortDirection,
          status: status[0],
          projectId,
          pageNumber,
          pageSize,
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

    const validationSchema = paginateSchema(EmployeeSchema);
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
