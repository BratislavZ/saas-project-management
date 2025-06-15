import "server-only";
import { auth } from "@clerk/nextjs/server";
import { logBadResponse } from "@/shared/utils/logger";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import { Project, ProjectSchema } from "../types/Project";
import { Organization } from "@/features/organizations/types/Organization";
import { buildURL } from "@/shared/utils/build-url";

type Props = {
  organizationId: Organization["id"];
  includeArchived?: boolean;
};

export async function getAllProjects({
  organizationId,
  includeArchived,
}: Props): Promise<Array<Pick<Project, "id" | "name" | "status">>> {
  const { getToken } = await auth.protect();

  try {
    const token = await getToken();

    const response = await fetch(
      buildURL({
        basePath: `${process.env.API_URL}/api/organization/${organizationId}/projects`,
        queryParams: {
          includeArchived: includeArchived ? "true" : undefined,
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
      throw new Error("Failed to get projects");
    }

    const data: unknown = await response.json();

    const validationSchema = z.array(
      ProjectSchema.pick({ id: true, name: true, status: true })
    );
    const validatedData = validationSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error(fromError(error));
    throw error;
  }
}
